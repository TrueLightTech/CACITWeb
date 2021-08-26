import axios from 'axios';

const BASEURL = "http://134.209.216.111:8090/api/";

let instance = axios;
// instance.defaults.headers.post['Content-Type'] = 'application/json';
instance.defaults.headers.common['X-Requested-With'] = 'hubtel';

//Get the consumer authToken
const authToken = hubtel.consumer_token;


const getRequestType = (method = "GET", basePath, relativePath, data, authorization, type) => {

  instance.defaults.headers.common['Authorization'] = "Bearer " + authToken;

  if (type.toLowerCase() === "url-encoded") {
    instance.defaults.headers.post['Content-Type'] = ContentType.URL_ENCODED;
  } else {
    instance.defaults.headers.post['Content-Type'] = ContentType.JSON;
  }

  switch (method) {
    case "GET":
      return instance.get(basePath + relativePath);
    case "POST":
      return instance.post(basePath + relativePath, data);
    case "PUT":
      return instance.put(basePath + relativePath, data);
    case "DELETE":
      return instance.delete(basePath + relativePath, data);
    default:
      return instance.get(basePath + relativePath);
  }

};

const makeRequest = ({path = "", baseUrl = "", data = {}, setAuthorization = false, method = "GET", authToken = "", type = "json"}) => {
  baseUrl = baseUrl.length !== 0 ? baseUrl : BASEURL;
  return getRequestType(method, baseUrl, path, data, setAuthorization, type)
};

const requestMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE"
};

const ContentType = {
  JSON: 'application/json',
  URL_ENCODED: 'application/x-www-form-urlencoded'
}

export default {
  methods: requestMethods,
  makeRequest: makeRequest
};
