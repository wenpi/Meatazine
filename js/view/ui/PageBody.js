jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  contextButtons: null,
  items: [],
  isSentByMe: false,
  initialize: function (options) {
    this.$el = $(this.el);
    this.contextButtons = options.contextButtons;
    this.book = options.book;
    this.book.on('change:size', this.resizeHandler, this);
    this.source = options.source;
    this.source.on('change:type', this.source_selectHandler, this);
    delete this.options;
  },
  render: function () {
    while (this.items.length > 0) {
      this.items.shift().remove();
    }
    this.$el.html(this.model.get('template'));
    var count = 0;
    _.each(this.$('[data-config]'), function (elementDom, index) {
      var collection, element,
          config = JSON.parse($(elementDom).attr('data-config'));
      if (!config.noData) {
      	collection = this.model.getContentAt(count++);
      }
      element = Meatazine.view.element.ElementFactory.getElement(config.type, {
        collection: collection,
        el: elementDom
      });
      element.on('change', this.element_changeHandler, this);
      element.on('edit:start', this.element_editStartHandler, this);
      element.on('edit:stop', this.element_editStopHandler, this);
      this.items[index] = element;
    }, this);
    
    this.$('.editable').prop('contenteditable', true);
    this.refreshThumbnail();
    this.trigger('edit');
  },
  showLoading: function () {
    this.$el.html('<p align="center" style="padding-top:40px"><img src="img/loading.gif" /><br />加载中，请稍后</p>');
  },
  useTemplate: function(isFromPage) {
    if (isFromPage && this.model.get('template') != '') {
      this.render();
      return;
    }
    if (this.source.hasTemplate(this.model.get('templateType'))){
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.render();
      return;
    }
    this.source.on('complete', this.source_completeHandler, this);
    this.source.fetch(this.model.get('templateType'));
    this.showLoading();
  },
  refreshThumbnail: function () {
    var self = this;
    html2canvas(this.$el, {onrendered: function (canvas) {
      self.trigger('change', canvas);
    }});
  },
  pageList_selectHandler: function (model) {
    this.model = model;
    this.useTemplate(true);
    this.isSentByMe = this.source.get('type') != this.model.get('templateType');
    this.source.set('type', this.model.get('templateType'));
  },
  source_selectHandler: function () {
    if (this.isSentByMe) {
      this.isSentByMe = false;
      return;
    }
    this.model.reset();
    this.model.set('templateType', this.source.get('type'));
    this.useTemplate();
  },
  source_completeHandler: function () {
    if (this.source.hasTemplate(this.model.get('templateType'))) {
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.source.off('complete', this.source_completeHandler);
      this.render();
    }
  },
  resizeHandler: function (w, h) {
    this.$el.width(w);
    this.$el.height(h);
  },
  element_changeHandler: function (collection) {
    this.refreshThumbnail();
    this.trigger('edit', collection);
  },
  element_editStartHandler: function (event, type) {
    this.contextButtons.showButtons(type);
    event.target.addEditorHandler(this.contextButtons);
  },
  element_editStopHandler: function (event) {
    this.contextButtons.off(null, null, event.target);
    this.contextButtons.disable();
  }
})