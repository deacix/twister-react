var React = require('react');
var Postboard = require("../common/Postboard.js");
var SetIntervalMixin = require("../common/SetIntervalMixin.js");
var StreamMixin = require("../common/StreamMixin.js");
var SafeStateChangeMixin = require('../common/SafeStateChangeMixin.js');
var EventListenerMixin = require('../common/EventListenerMixin.js');


var ReactBootstrap = require('react-bootstrap')
  , NavItem = ReactBootstrap.NavItem
  , Nav = ReactBootstrap.Nav
  , ListGroup = ReactBootstrap.ListGroup
  , ListGroupItem = ReactBootstrap.ListGroupItem
  , Panel = ReactBootstrap.Panel
  , Glyphicon = ReactBootstrap.Glyphicon
  , Button = ReactBootstrap.Button

module.exports = Timeline = React.createClass({displayName: "Timeline",
    
  mixins:[
    StreamMixin,
    SetIntervalMixin,
    SafeStateChangeMixin,
    EventListenerMixin('newpostbyuser')
  ],
  contextTypes: {
    router: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      username: this.context.router.getCurrentParams().username,
      postid: parseInt(this.context.router.getCurrentParams().postid),
      data: [], 
      postIdentifiers: {},
      loading: true
    };
  },
  updatePosts: function(outdatedLimit) {
      
    if (!outdatedLimit) {outdatedLimit=this.props.pollInterval/2;}

    var thisComponent = this;
    var thisUsername = this.state.username;

    var goUpConversation = function (post) {
      
        thisComponent.setStateSafe({loading: false});
        
        if (post.isReply()) {

            post.doPostRepliedTo(goUpConversation);

        } else {

            doRepliesRecursive(post);

        }
    }

    var doRepliesRecursive = function (post) {

        thisComponent.addPost(post);
        post.doReplies(function(replies){

            replies.doPosts(doRepliesRecursive);

        });

    };

    Twister.getUser(this.state.username).doPost(this.state.postid,goUpConversation,{outdatedLimit: outdatedLimit});

  },
  componentDidMount: function() {

    this.updatePosts(2*this.props.pollInterval);
    this.setInterval(this.updatePosts, this.props.pollInterval*1000);

  },
  onnewpostbyuser: function (event) {
    
    //alert("got event")
    
    this.updatePosts(-1);
    
  },
  render: function() {
      return (
          React.createElement(Postboard, {header: 
          React.createElement(ListGroupItem, null, 
            "Conversation"
          ), 
        data: this.state.data, loading: this.state.loading})
        );
  }
});