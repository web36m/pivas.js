PiVas - JavaScript framework
=====

JavaScript framework for scalable web applications.
Focuses on a full asynchronous web applications: Social networks, Online games, Online services, Etc...

--

###Performance
In the framework, there are no heavy wrappers to work with HTML. Selectors are not used for node DOM. Striving for minimalism, the use of standard classes and methods of the browser.

--

###Extensibility
The framework can be easily extended. It can be easily integrated third-party libraries. He can be used in other frameworks as a library. Methods can be easily modified to fit your needs.

--

###Dynamicity
Independent modules. Loading of scripts on the fly. Object Notation document structure. Generation dom. Event model. Full asynchronous client-server architecture, WebSockets.

--

###How to start

######Insert into head of html document.

```html
<script type="text/javascript" src="/lib/PV.js"></script>
<script type="text/javascript">
PV.init({
  version : '1.0.2',
  languages : ['en'],
  preload : [
    '/lib/PV.Cookie.js',
    '/lib/PV.Dom.js',
    '/lib/PV.Animate.js',
    '/lib/PV.WebSocket.js',
    '/lib/PV.Language.js',
    '/lib/PV.Dom.Slider.js',
    '/lib/PV.Dom.Switch.js',
    '/lib/PV.Dom.Grid.js'
  ],
  descriptors : '/app/descriptors',
  locales : '/app/locales',
  modules : '/app/modules',
  templates : '/app/templates',
  views : '/app/views'
});
</script>
```
######Insert in the end of the body of html document.

```html
<script type="text/javascript">
PV.ready(function(){
  PV.Language.identify();
  PV.factoryModule('Example1');
  PV.factoryModule('Example2');
});
</script>
```
