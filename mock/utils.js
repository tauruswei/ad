import Mock from "mockjs";

export const param2Obj = function (url) {
  const search = url.split("?")[1];
  let arr = [];
  if (!search) {
    return {};
  }
  arr = search.split("&");
  arr = arr.map((item) => {
    return item.replace("=", ":");
  });
  return JSON.parse('{"' + arr.join('","').replace(/:/g, '":"') + '"}');
};

export const getList = function (req, list) {
  console.log(req);
  const { search,pageNum, pageSize } = param2Obj(req.url);
  let total = 0;
  let pageList = [];
  total = list.length;
  if (pageNum) {
    pageList = list.filter((item, index) => index < pageSize * pageNum && index >= pageSize * (pageNum - 1));
  } else {
    pageList = list;
  }
  return {
    code: 0,
    msg:"success",
    data: {
      data: pageList,
      total: total
    },
  };
};
export const getListNoPage = function (req, list) {
  console.log(req);
  return {
    code: 0,
    msg:"success",
    data: list,
  };
};
export const mockXHR = function (mocks) {
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
  Mock.XHR.prototype.send = function () {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false;

      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType;
      }
    }
    this.proxy_send(...arguments);
  };

  function XHR2ExpressReqWrap(respond) {
    return function (options) {
      let result = null;
      if (respond instanceof Function) {
        const { body, type, url } = options;
        // https://expressjs.com/en/4x/api.html#req
        result = respond({
          method: type,
          body: JSON.parse(body),
          url: url,
        });
      } else {
        result = respond;
      }
      return Mock.mock(result);
    };
  }
  if (mocks) {
    for (const i of mocks) {
      Mock.mock(new RegExp(i.url), i.type || "get", XHR2ExpressReqWrap(i.response));
    }
  }
};
