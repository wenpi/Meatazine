jQuery.namespace('Meatazine.model');
Meatazine.model.UserModel = Backbone.Model.extend({
  defaults: {
    local: null,
    remote: null,
    isLogin: null,
  },
  checkLoginStatus: function () {
    var isQQLogin = this.checkQQLoginStatus(),
        isWeiboLogin = false;
    if (isQQLogin) {
      this.set({
        openid: localStorage.getItem('openid'),
        token: localStorage.getItem('token'),
        info: JSON.parse(localStorage.getItem('info')),
        isLogin: isQQLogin,
      });
      Meatazine.GUI.navbar.showQQLoginResult(this.get('info'));
      this.remoteFetchData();
      this.set('isLogin', true);
      return;
    }
    isWeiboLogin = this.checkWeiboLoginStatus();
    this.set('isLogin', isWeiboLogin);
  },
  checkQQLoginStatus: function () {
    var self = this,
        isQQLogin = QC.Login.check();
    if (!isQQLogin) {
      this.initQQLogin();
    }
    return isQQLogin;
  },
  checkWeiboLoginStatus: function () {
    return false;
  },
  getNextLocalIndex: function () {
    return this.get('local').getNextIndex();
  },
  getMe: function () {
    var self = this;
    QC.Login.getMe(function (openid, token) {
      localStorage.setItem('openid', openid);
      localStorage.setItem('token', token);
      self.set({
        openid: openid,
        token: token,
      });
      self.remoteFetchData();
    });
  },
  getUserInfo: function () {
    QC.api('get_user_info', {})
      .success(function (response) {
        Meatazine.GUI.navbar.showQQLoginResult(response.data);
      })
      .error(function (response) {
        console.log('get user info failed..', response);
      });
  },
  initLogin: function () {
    this.initQQLogin();
  },
  initQQLogin: function () {
    var self = this;
    QC.Login({
      btnId: "qqLoginBtn",
      scope: "all",
      size: "A_M",
    }, function (reqData, options) {
      self.set('isLogin', true);
      Meatazine.GUI.navbar.enablePublishButtons();
      Meatazine.GUI.navbar.showQQLoginResult(reqData, options);
      self.getMe();
      localStorage.setItem('info', JSON.stringify(reqData));
    }, function (options) {
      Meatazine.GUI.navbar.disablePublishButtons();
      localStorage.removeItem('openid');
      localStorage.removeItem('token');
      localStorage.removeItem('info');
      self.attributes.remote.reset();
    });
  },
  remoteFetchData: function () {
    var self = this;
    this.get('remote').fetch({
      data: {
        api: 'fetch',
        openid: this.get('openid'),
      },
    });
  },
  save: function (data) {
    var collection = this.get('isLogin') ? this.get('remote') : this.get('local');
    if (!collection.some(function (model, i) {
      return model.get('id') == id;
    })) {
      collection.create({
        id: data.id,
        datetime: Meatazine.utils.getDatetime(),
        name: data.name,
        icon: data.icon,
      });
    }
  },
  autosaveHandler: function () {
    this.get('local').hasAutoSave = true;
  },
});