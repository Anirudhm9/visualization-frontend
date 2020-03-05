import { AccessToken, logout } from 'contexts/helpers'
import { notify } from 'components'
import { axiosInstance } from '../index';
/**
 *  @errorHelper :  Function to return error StatusText.
 */
const errorHelper = (error, variant) => {
  if (error.response === undefined) {
    notify("Network Error");
    logout();
    return false;
  }
  if (error.response.statusCode === 401) {
    if (variant === "login")
      return notify("Invalid Credentials");
    notify("You may have been logged out");
    logout();
    return false;
  }
  if (error.response.data.statusCode === 401) {
    if (variant === "login")
      return notify("Invalid Credentials");
    notify("You may have been logged out");
    logout();
    return false;
  }
  if (error.response.status === 401) {
    if (variant === "login")
      return notify("Invalid Credentials");
    notify("You may have been logged out");
    logout();
    return false;
  }
  if (error.response.data.message !== "") {
    notify(error.response.data.message);
    return false;
  }
  if (error.response.statusText !== "") {
    notify(error.response.statusText);
    return false;
  }
}

const performCallback = (callback, data) => {
  if (callback instanceof Function) {
    if (data !== undefined)
      return callback(data);
    callback();
  }
};

class API {
  displayAccessToken = () => {
    console.log(AccessToken)
  }

  login = (data, callback) => {
    axiosInstance.post('admin/login', data).then(response => {
      return callback(response.data.data)
    }).catch(error => {
      errorHelper(error, "login")
    })
  }

  accessTokenLogin = (callback) => {
    axiosInstance.post('accessTokenLogin', {}, {
      headers: {
        authorization: "Bearer " + AccessToken
      }
    }).then(response => performCallback(callback, AccessToken)).catch(error => errorHelper(error));
  }

  logoutUser = (callback) => {
    logout();
    performCallback(callback);
  }

  getBlocks = (callback) => {
    axiosInstance.get('/rcm/getBlock', {
    }).then(response => {
      return callback(response.data.data)
    }).catch(error => {
      errorHelper(error)
    })
  }

  uploadImage = (data, callback) => {
    axiosInstance.post('/upload/uploadImage', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(response => {
      notify("Image Uploaded")
      return callback(response.data.data.imageFileURL.original)
    }).catch(error => {
      errorHelper(error)
    })
  }

  updateBlock = (data,callback) => {
    axiosInstance.put('/rcm/updateBlock', data, {
    }).then(response => {
      return callback(response.data.data)
    }).catch(error => {
      errorHelper(error)
    })
  }

}
const instance = new API();
export default instance;
