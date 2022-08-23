'use strict';

const Controller = require('egg').Controller;

// 导入七牛云sdk
const qiniu = require('qiniu');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    if (!ctx.request.files.length) {
      ctx.body = {
        code: 7002,
        msg: '请上传文件',
      };

      return false;
    }

    const file = ctx.request.files[0];

    const url = await this.qiNiuUpload(file);

    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: url,
    };
  }

  qiNiuUpload(file) {
    return new Promise((resolve, reject) => {

      // 获取【文件名】【文件路径】
      const { filename, filepath: filePath } = file;

      const fileNameArr = filename.split('.');

      const fileSuffix = fileNameArr[fileNameArr.length - 1];

      const fileName = `${Date.now()}.${fileSuffix}`;

      // 配置【accessKey, secretKey, bucket】
      const { ACCESSKEY, SECRETKEY, BUCKET, ZONE, IMGHOST } = process.env;

      // 获取鉴权对象mac
      const mac = new qiniu.auth.digest.Mac(ACCESSKEY, SECRETKEY);

      // 获取上传凭证
      const putPolicy = new qiniu.rs.PutPolicy({ scope: BUCKET });

      // 获取上传token
      const uploadToken = putPolicy.uploadToken(mac);

      // 上传文件之前，必须要构建一个上传用的config对象
      const config = new qiniu.conf.Config();

      // 空间对应的机房 => 华东-浙江:z0 || 华东-浙江2:cn-east-2 || 华北-河北:z1 || 华南-广东:z2 || 北美-洛杉矶:na0 || 亚太-新加坡（原东南亚）:as0 || 亚太-首尔:ap-northeast-1
      // [官方文档](https://developer.qiniu.com/kodo/1671/region-endpoint-fq)
      config.zone = qiniu.zone['Zone_' + ZONE];

      const formUploader = new qiniu.form_up.FormUploader(config);

      const putExtra = new qiniu.form_up.PutExtra();

      // 文件上传
      formUploader.putFile(uploadToken, fileName, filePath, putExtra, (err, ret) => {
        if (!err) {
          // 上传成功， 处理返回值
          // console.log(ret.hash, ret.key);

          const url = `${IMGHOST}/${ret.key}`;

          resolve(url);
        } else {
          // 上传失败， 处理返回代码
          // console.log(err);

          reject(err);
        }
      });
    });
  }

}

module.exports = HomeController;