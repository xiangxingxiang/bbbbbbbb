import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'
import whiteList from './whiteList'
export default axios

axios.defaults.timeout = 15000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.baseURL = process.env.API_ROOT;
axios.defaults.STATISTICS = process.env.API_ROOT_STATISTICS;
axios.defaults.BUSINESS = process.env.API_ROOT_BUSINESS;

axios.defaults.urlCheck = {};

axios.interceptors.request.use(config => {
    const { baseURL, STATISTICS, BUSINESS } = config;
    let url = config.url.replace(/^\//, '');
    let path = url;
    if (!/^(https|http)/.test(url)) {
        url = `${baseURL}${url}`;
    } else {
        url = url.replace(/^\//, '');
        if (url.includes(STATISTICS)) {
            url = url.split(STATISTICS)[1];
            url = url.replace(/^\//, '');
            path = url;
            url = `${STATISTICS}/${url}`;
        } else if (url.includes(BUSINESS)) {
            url = url.split(BUSINESS)[1];
            url = url.replace(/^\//, '');
            path = url;
            url = `${BUSINESS}/${url}`;
        };
    }

    const { urlCheck } = axios.defaults;
    if (!whiteList.includes(path) && urlCheck.hasOwnProperty(url) && !urlCheck[url]) {
        return Promise.reject({
            response: {
                data: {
                    msg: '请勿频繁操作',
                    code: 429,
                    url
                }
            }
        });
    }
    if (!whiteList.includes(url) && urlCheck.hasOwnProperty(url) && urlCheck[url]) {
        urlCheck[url] = false;
    }
    if (!whiteList.includes(url) && !axios.defaults.urlCheck.hasOwnProperty(url)) {
        urlCheck[url] = false;
    }
    let token = localStorage.getItem("TOKEN");
    if (token) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, err => {
    return Promise.reject(err);
});
axios.interceptors.response.use(
    res => {
        const { urlCheck } = axios.defaults;
        for (let i in urlCheck) {
            if (!urlCheck[i]) {
                urlCheck[i] = true;
            }
        }
        if (!tokenVertify(res.data)) { //token失效
            return;
        }
        if (res.status === 200) { //请求成功
            if (res.data.code === 0) { //业务正常
                return res.data.data;
            } else { //其它业务异常（不会走到这里）
                console.log('sadasdasd', axios.defaults.urlCheck);
                return Promise.reject({
                    msg: res.data.msg || '接口返回数据有误',
                    type: 'business',
                    code: res.data.code
                })
            }
        } else { //请求异常（不会走到这里）
            let msg = '接口出错了'
            if (res) {
                if (res.msg) {
                    msg = res.msg
                }
            }
            return Promise.reject({
                msg: msg,
                type: 'server',
                code: res.status
            })
        }
    },
    error => {
        const { urlCheck } = axios.defaults;
        for (let i in urlCheck) {
            if (!urlCheck[i]) {
                urlCheck[i] = true;
            }
        }
        let errRes = error.response && error.response.data;
        if (!tokenVertify(errRes)) { //token失效
            return;
        }
        let msg = '接口出错了', code;
        if (errRes) {
            if (errRes.msg) msg = errRes.msg;
            if (errRes.code) code = errRes.code;
        }
        return Promise.reject({
            code,
            msg,
            type: 'network',
        });
    });

var tokenVertify = function (obj) {
    if (obj && obj.code === 9999) { //token失效
        localStorage.removeItem("TOKEN");
        router.replace({
            path: '/'
        });
        Message({
            type: 'warning',
            code: 9999,
            message: obj.msg,
        })
        return false;
    }
    return true;
}
