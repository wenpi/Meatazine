jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.ElementFactory = {
  slideBody: null,
  slideNavi: null,
  getElement: function (type, options) {
    var element;
    switch (type) {
      case 'slide-navi':
        element = new Meatazine.view.element.SlideNaviElement(options);
        if (this.slideBody != null) {
          this.slideBody.setNavi(element);
          element.body = this.slideBody;
          this.slideBody = null;
        } else {
          this.slideNavi = element;
        }
        break;
        
      case 'slide-main':
        element = new Meatazine.view.element.SlideBodyElement(options);
        if (this.slideNavi != null) {
          this.slideNavi.body = element;
          element.setNavi(this.slideNavi);
          this.slideNavi = null;
        } else {
          this.slideBody = element;
        }
        break;
        
      default:
        element = new Meatazine.view.element.NormalElement(options);
        break;
    }
    return element;
  }
}