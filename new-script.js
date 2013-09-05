$(function() {
  var Yoyo = Backbone.Model.extend({
      defaults: {
          item_name: "YoYo Special",
          price: 100
      }
  });

  var Yoyos = Backbone.Collection.extend({
      model: Yoyo,
      
      sessionStorage: new Backbone.SessionStorage("billing"),

      totalPrice: function() {
        return this.reduce(function(initial, yoyo) {
          return initial + Number(yoyo.get('price'));
        }, 0);
      },

      totalItems: function() {
        return this.length;
      }
  });

  var YoyoView = Backbone.View.extend({
    tagName: "li",

    template: _.template($("#itemOrdered").html()),

    events: {
      "keypress .price": "updateItem",
      "dblclick .inputs": "edit",
      "click .remove": "clear"
    },
      
    initialize: function(){
        this.model.on('change',this.render, this);
        this.model.on('destroy',this.remove, this);
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    edit: function(){
      this.$(".itemName").removeAttr("readonly");
      this.$(".price").removeAttr("readonly");
      this.$(".itemName").focus();
    },

    saveItem: function() {
      var name = this.$(".itemName").val();
      var price = this.$(".price").val();
      
      this.model.save({"item_name": name, "price": price});
    },

    updateItem: function(e) {
      if(e.keyCode == 13) this.saveItem();
    },

    clear: function() {
      this.model.destroy();
      this.model.unbind();
    }
  });

  var yoyos = new Yoyos;
  var YoyoFinal = Backbone.View.extend({
    el: $("#ordering"),

    events: {
      "blur #priceInput": "createOrder"
    },

    initialize: function() {
      this.collection = new Yoyos;
      this.collection.on('add', this.addNewOrder, this.collection);
      this.collection.on('reset', this.addAll, this.collection);
      this.listenTo(this.collection, 'all', this.render);
      this.collection.fetch();
    },

    render: function() {
      if(this.collection.length > 0) {
        var totalItems = this.collection.totalItems();
        var totalPrice = this.collection.totalPrice();

        $("#itemCount").text(totalItems);
        $("#totalPrice").text(totalPrice);
        $("#footer").show();
      } else {
        $("#footer").hide();
      }
    },

    addNewOrder: function(order) {
      var view = new YoyoView({model: order});
      $('#orders').append(view.render().el);
    },

    createOrder: function(e) {
      var name = $("#itemInput").val();
      var price = $("#priceInput").val();
      if (!name || !price) return;
      this.collection.create({item_name: name, price: price});
      $("#itemInput").val('');
      $("#priceInput").val('');
    },

    addAll: function() {
      $('#orders').html('');
      this.collection.each(this.addNewOrder, this);
    },
  });

  new YoyoFinal();
});