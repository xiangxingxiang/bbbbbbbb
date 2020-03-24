let OSS = require('ali-oss');
<!-- import Utils from './util' -->
const env = process.env.NODE_ENV;
export default {
  /**
   * 创建随机字符串
   * @param num
   * @returns {string}
   */
  randomString(num) {
    let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let res = '';
    for (let i = 0; i < num; i++) {
      let id = Math.ceil(Math.random() * 35);
      res += chars[id]
    }
    return res
  },

  /**
   * 创建oss客户端对象
   * @returns {*}
   */
  createOssClient() {
    return new Promise((resolve, reject) => {
      let client = new OSS({
        region: 'oss-cn-beijing',
        accessKeyId: 'LTAIttineHZHk0Xh',
        accessKeySecret: 'ejSCZbTa9o4jxFATTkTm6xffnSBX6A',
        bucket: env == 'production' ? 'daishu-kejian' : 'daishu-kejian-test',
      });
      resolve(client)
    })
  },
  /**
   * 文件上传
   * @param option 参考csdn: https://blog.csdn.net/qq_27626333/article/details/81463139
   */
  ossUploadFile(option, isAttach = true) {
    let file = option.file;
    const self = this;
    return new Promise((resolve, reject) => {
      let date = Utils.dateFormat(new Date(), 'yyyyMMdd');// 当前时间
      let dateTime = Utils.dateFormat(new Date(), 'yyyyMMddhhmmss'); // 当前时间
      let randomStr = self.randomString(4);//  4位随机字符串
      let extensionName = file.name.substr(file.name.indexOf('.')); // 文件扩展名
      let fileName = date + '/' + dateTime + '_' + randomStr + extensionName; // 文件名字（相对于根目录的路径 + 文件名）
      console.log(file.name)
      // 执行上传
      self.createOssClient().then(client => {
        // 上传处理
        // 分片上传文件
        // console.log(file);
        let uploadOpt = {
          progress: function (p) {
            let e = {};
            e.percent = p * 100;
            // console.log('Progress: ' + p)
            if (option.onProgress && typeof option.onProgress === 'function')
              option.onProgress(e)
          },
          headers: {
          }
        };
        if (isAttach) {
          uploadOpt.headers['Content-Disposition'] = 'attachment;filename=' + encodeURIComponent(file.name);
        }
        client.multipartUpload(fileName, file, uploadOpt)
        .then((val) => {
          console.log(val)
          // console.info(val)
          if (val.res.statusCode === 200) {
            if (option.onSuccess && typeof option.onSuccess === 'function')
              option.onSuccess(val);
            // 异步上传,返回数据
            resolve({
              fileName: val.name,
              fileUrl: `http://${client.options.bucket}.${client.options.region}.aliyuncs.com/${fileName}`,
              fileSize: file.size,
            });
          } else {
            if (option.onError && typeof option.onError === 'function')
              option.onError('上传失败');
            reject('上传失败')
          }
        }, err => {
          if (option.onError && typeof option.onError === 'function')
            option.onError('上传失败');
          reject('上传失败')
        })
      })
    })
  }
}
