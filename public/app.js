(function() {
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  // model
  var Photo = Backbone.Model.extend({
    sync(method, model, options) {
      if (method === 'create') {
        var data = new FormData();
        data.append('file', model.get('file'));
        data.append('caption', model.get('caption'));
        return $.ajax(this.url(), {
          type: 'POST',
          data: data,
          processData: false,
          contentType: false,
          success(data) {
            options.success(data);
          }
        });
      }
      return Backbone.sync.apply(this, arguments);
    }
  });

  var Photos = Backbone.Collection.extend({
    model: Photo,
    url: '/photos'
  });

  // views
  var NavbarView = Backbone.View.extend({
    tmpl: _.template($('#navbarView').html()),
    render() {
      this.$el.html(this.tmpl());
      return this;
    },
    events: {
      'click a': 'handleClick'
    },
    handleClick(event) {
      event.preventDefault();
      var href = $(event.currentTarget).attr('href');
      ROUTER.navigate(href, {
        trigger: true
      });
    }
  });

  // upload photo form
  var UploadPhotoFormView = Backbone.View.extend({
    tagName: 'form',
    tmpl: _.template($('#uploadPhotoFormView').html()),
    initialize(options) {
      this.photos = options.photos;
    },
    render() {
      this.$el.html(this.tmpl());
      return this;
    },
    events: {
      'click button': 'uploadPhoto'
    },
    uploadPhoto(event) {
      event.preventDefault();
      var photo = new Photo({
        file: this.$('#photo')[0].files[0],
        caption: this.$('#caption').val()
      });
      this.photos.create(photo, {
        wait: true
      });
      this.el.reset();
    }
  });

  // photo view
  var PhotoView = Backbone.View.extend({
    tmpl: _.template($('#photoView').html()),
    initialize(options) {
      this.photos = options.photos;
      this.photos.on('add', photo => {
        this.$el.prepend(this.tmpl(photo.toJSON()));
      });
    },
    render() {
      return this;
    }
  });

  var PhotosView = Backbone.View.extend({
    tmpl: _.template($('#photosView').html()),
    carouselItemTmpl: _.template($('#carouselItemView').html()),
    render() {
      this.$el.html(this.tmpl());
      var $carousel = this.$('.carousel-inner');
      this.collection.forEach(photo => {
        $carousel.append(this.carouselItemTmpl(photo.toJSON()));
      });
      $carousel.find('.carousel-item').first().addClass('active');
      return this;
    }
  });

  // router
  var AppRouter = Backbone.Router.extend({
    initialize(options) {
      this.$main = options.$main;
      this.photos = options.photos;
      this.$navbar = $('#navbar');
    },
    routes: {
      '': 'index',
      'upload': 'uploadPhoto'
    },
    index() {
      this.$navbar.html(new NavbarView().render().el);
      this.photos.fetch().then(() => {
        var pv = new PhotosView({
          collection: this.photos
        });
        this.$main.html(pv.render.call(pv).el);
      });
    },
    uploadPhoto() {
      var form = new UploadPhotoFormView({
        photos: this.photos
      });
      var v = new PhotoView({
        photos: this.photos
      });
      this.$navbar.html(new NavbarView().render().el);
      this.$main.html(form.render().el);
      this.$main.append(v.render().el);
    }
  });


  // router instance
  var ROUTER = new AppRouter({
    $main: $('#main'),
    photos: new Photos()
  });

  // start history
  Backbone.history.start({
    pushState: true
  });
})();
