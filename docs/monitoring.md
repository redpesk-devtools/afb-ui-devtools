# Introduction

The Binder devtool provides a graphical environment automatically populated to test the apis and verbs available on your binding.  
&nbsp;
![Demo Binder Devtool](images/demo-verbs.png)
&nbsp;
## Access to Binder Devtool UI

## Navigation Bar

**Binder WS Active / Disconnected** At the top of the UI, a green Binder WS Active button means that a binding is currently running on your environment and is accessible for testing and monitoring. In case of disconnection, the button turns to red and the verbs disappear. The UI will automatically attempt to reconnect itself.  

**Debug/Monitoring** When binding runs on monitoring mode, this will open a new tab to the debug/monitoring interface.  

&nbsp;

### Apis and verbs

**General** Provides a selection of verbs sorted by groups with additional information such as status, actions and samples.  
**Advanced** Displays all verbs available by api accessible by the running binding. Advanced is the default mode if General is not available.  
&nbsp;
![Demo Binder Devtool](images/demo-ui.gif)
&nbsp;
### Testing a verb

Click on a verb to show its testing form. On **General mode**, clicking on some samples or actions, if provided, will directly pre-fill the query input with parameters. It is possible to modify the query before clicking on test. Sending an empty query is possible, however queries have to be formatted in json with "".

&nbsp;
### Monitoring

**Questions** Displays the list of calls sent to apis.  
**Responses** Displays the apis responses to the requests above.  
**Events** Displays data sent by the apis from events subscribed to. 

*Note*: these three boxes are clearable by clicking on the bin icon on their top-left corner.






