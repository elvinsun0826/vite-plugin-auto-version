import type { Plugin, UserConfig } from "vite";
import fs from "fs/promises";

interface AutoVersionVitePluginOption {
  version: string;
  refreshTime: number;
  insertCheck: boolean;
}

const oldFiles: string[] = [];
let baseUrl = "/";
let publicDir = "public";
let outDir = "dist";

async function readOldVersionFromFile(
  filePath: string
): Promise<string | null> {
  try {
    const fileData = await fs.readFile(filePath, "utf8");

    if (!fileData) {
      // 如果文件内容为空，则返回null
      return null;
    }

    const jsonData = JSON.parse(fileData); // 将文件内容解析为json对象

    if (jsonData.version === undefined) return null;
    return jsonData.version;
  } catch (error) {
    // console.error('读取json文件时发生错误：', error)
    return null;
  }
}

function generateNewVersion(oldVersion: string) {
  // 将旧版本号按照"."进行分割为数组
  const oldVersionArr = oldVersion.split(".");

  // 对每个位置上的数字进行处理
  for (let i = oldVersionArr.length - 1; i >= 0; i--) {
    if (oldVersionArr[i] !== "9") {
      // 如果不是"9"，则加1并退出循环
      oldVersionArr[i] = (parseInt(oldVersionArr[i]) + 1).toString();
      break;
    } else {
      // 如果是"9"，则置为"0"并继续向前循环
      oldVersionArr[i] = "0";
    }
  }

  // 将数组中的数字拼接为一个新的版本号字符串
  const newVersion = oldVersionArr.join(".");

  return newVersion;
}

function saveJsonToFile(jsonData: object, filePath: string, fileName: string) {
  // 拼接文件路径和名称
  const fullPath = `${filePath}/${fileName}.json`;

  // 将json数据转换为字符串
  const jsonString = JSON.stringify(jsonData, null, 2); // 为了让json文件更容易阅读，这里采用2个空格作为缩进。

  // 写入json文件
  fs.writeFile(fullPath, jsonString, "utf-8").catch((error) => {
    console.error("写入版本json文件时发生错误：", error);
  });
}

function compareArrays(arr1: string[], arr2: string[]) {
  if (arr1.length !== arr2.length) {
    // 如果两个数组长度不同，则返回false
    return false;
  }

  arr1.sort();
  arr2.sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      // 如果存在不同的元素，则返回false
      return false;
    }
  }

  return true; // 数组内容完全相同，返回true
}

async function readDirFiles(baseDir: string, filesArray: string[] = []) {
  // 获取当前目录下所有文件及文件夹名
  const files = await fs.readdir(baseDir);

  // 遍历当前目录下所有文件及文件夹名
  for (const file of files) {
    const filePath = baseDir + "/" + file;
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      // 如果是目录，则递归读取
      await readDirFiles(filePath, filesArray);
    } else {
      // 如果是文件，则存储到数组中
      filesArray.push(filePath);
    }
  }

  return filesArray.map((item) => item.replace("\\\\", "/"));
}

function saveVersionToDir(version: string) {
  saveJsonToFile({ version }, publicDir, "version");
  saveJsonToFile({ version }, outDir, "version");
  console.log(
    `vite-plugin-auto-version: 版本文件生成成功，最新版本号:${version}！`
  );
}

export default function autoVersionVitePlugin(
  options?: AutoVersionVitePluginOption
): Plugin {
  const inputVersion = options?.version;
  const refreshTime = options?.refreshTime || 5 * 60 * 1000;
  const insertCheck = options?.insertCheck || true;
  return {
    name: "auto-version",
    apply: "build",
    config(config: UserConfig) {
      // 获取用户配置的公共目录
      if (config.publicDir) {
        publicDir = config.publicDir;
      }
      // 获取用户配置的打包输出目录
      if (config.build?.outDir) {
        outDir = config.build.outDir;
      }
      // 获取用户配置的公共路径
      if (config.base && config.base !== "/") {
        baseUrl = config.base;
        if (!baseUrl.startsWith("/")) baseUrl = "/" + baseUrl;
        if (!baseUrl.endsWith("/")) baseUrl = baseUrl + "/";
      }
    },
    buildStart() {
      readDirFiles(outDir)
        .then((files) => {
          oldFiles.length = 0;
          oldFiles.push(...files);
        })
        .catch((err) => console.log(err));
    },
    closeBundle() {
      readDirFiles(outDir)
        .then((files) => {
          // 如果存在指定的版本号，则直接保存指定版本号（有可能想要强制更新版本号）
          if (inputVersion) {
            saveVersionToDir(inputVersion);
          }
          readOldVersionFromFile(publicDir + "/version.json").then(
            (oldVersion) => {
              let newVersion = "1.0.0";
              // 如果打包前后产物一致
              if (compareArrays(files, oldFiles)) {
                saveVersionToDir(oldVersion || newVersion);
              } else {
                // 如果打包前后产物不同
                if (oldVersion) {
                  newVersion = generateNewVersion(oldVersion);
                }
                saveVersionToDir(newVersion);
              }
            }
          );
        })
        .catch((err) => console.log(err));
    },
    transformIndexHtml() {
      if (!insertCheck) return;
      return [
        {
          tag: "script",
          children: `
          function getVersion() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '${baseUrl}version.json', true);
            xhr.onreadystatechange = function() {
              if(xhr.readyState === 4 && xhr.status === 200) {
                const newVersion = JSON.parse(xhr.responseText);
                if (newVersion.version !== undefined) {
                  const oldVersion = localStorage.getItem("VERSION");
                  if (oldVersion && oldVersion !== newVersion.version) {
                    alert('程序有新的更新，请刷新页面！');
                  }
                  localStorage.setItem("VERSION", newVersion.version);
                }
              }
            };
            xhr.send();
          }
          getVersion();
          setInterval(getVersion, ${refreshTime});
          `,
          injectTo: "body",
        },
      ];
    },
  };
}
