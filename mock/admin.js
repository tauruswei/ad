import { param2Obj } from './utils.js';
import Mock from "mockjs";
let users = Mock.mock({
  code: 200,
  msg: "success",
  "data|6": [
    {
      id: "@increment(0)",
      name: "@word(5, 7)",
      email: "125792857234@qq.com.cn",
      password: "@word(7, 12)",
      roleName: '@pick("user","admin")',
      createTime: '@datetime()'
    },
  ],
});
let roles = {
  code: 200,
  msg: "success",
  data: [
    {
      id: 1,
      name: "user",
    },
    {
      id: 0,
      name: "admin",
    },
  ],
};
export default {
  loginServ: (req) => {
    const { userPassword ,userName} = req.body;
    let response = {};
    if (userPassword) {
      response = {
        code: 200,
        msg: "success",
        data: {
          token: "eyJpZCI6MSwiZXhwaXJlIjoxNjE5MTQ3ODk0LCJOZXR3b3JrSWQiOjB9.e61af7bb5d0973c77d02afb41a8da3b424355ff403875c7eaad7c10925b95e75",
          user: {
            email: userName,
            name: 'admin',
            id: 1,
            role: 1,//'@pick([0,1])'
            account: "0x5fb6ac2aff7b356ab5bbd49e544e63557cdb1e13"
          },
        },
      };
    } else {
      response = {
        code: 500,
        msg: "账号或密码错误",
      };
    }
    return response;
  },
  checkNameServ: (req) => {
    console.log(req)
    let response;
    const { userName } = param2Obj(req.url);
    if (userName) {
      response = {
        code: 200,
        msg: "success",
        data: true
      }
    } else {
      response = {
        code: 500,
        msg: "接口参数错误",
        data: null
      }
    }
    return response
  },
  userServ: (req) => {
    return {
      code: 200,
      msg: "success",
      data: users.data[0]
    }
  },
  usersServ: (req) => {
    console.log(req)
    return users
  },
  rolesServ: (req) => {
    console.log(req)
    return roles
  },
  walletServ: () => {
    return {
      code: 200,
      msg: "success",
      data: {
        channelAddress: "0x0000000000000000000000000000000000000000",
        clubAddress: "0x0000000000000000000000000000000000000000",
        userAddress: "0x5fb6ac2aff7b356ab5bbd49e544e63557cdb1e13"
      }
    }
  },
  codeServ: () => {
    return {
      code: 200,
      msg: "success",
      data: '2345'
    }
  }
};
