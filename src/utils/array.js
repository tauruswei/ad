const groupBy = (array, f) => {
  const groups = {};
  array.forEach(function (o) {
    const group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  return Object.keys(groups).map(function (group) {
    return groups[group];
  });
};

export const arrayGroupBy = (list, groupId) => {
  const sorted = groupBy(list, function (item) {
    return [item[groupId]];
  });
  return sorted;
};
export const arrToObj = (arr) => {
  if (!arr.length) return;
  let obj = {};
  arr.forEach((item) => {
    obj[item.key] = item.value ? item.value : "";
  });
  return obj;
};
//深层
export const conletrToObj = function (array) {
  let thisEleObj = new Object();
  if (typeof array == "object") {
    for (let i in array) {
      let thisEle = conletrToObj(array[i]);
      thisEleObj[i] = thisEle;
    }
  } else {
    thisEleObj = array;
  }
  return thisEleObj;
};
export const objToArray = (obj) => {
  if (Object.keys(obj) == 0) return;
  let arr = [];
  for (let k in obj) {
    let item = {
      key: k,
      value: obj[k],
    };
    arr.push(item);
  }
  return arr;
};
