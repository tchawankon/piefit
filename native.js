'use strict';
/* PieFit native bridge: only active inside the Android app (Capacitor). In the browser every call is a no-op. */
const Native = (() => {
  const C = window.Capacitor;
  const on = !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform());
  const P = name => (on && C.Plugins && C.Plugins[name]) || null;
  const REST_ID = 7001;
  let ready = false;
  // ask for notification permission and create a loud "rest timer" channel once
  async function prepare(){
    const LN = P('LocalNotifications'); if(!LN || ready) return; ready = true;
    try {
      const st = await LN.checkPermissions();
      if(st.display !== 'granted') await LN.requestPermissions();
      await LN.createChannel({id:'rest', name:'Rest timer', description:'Alerts when your rest is over',
        importance:5, visibility:1, vibration:true, lights:true});
    } catch(e){}
  }
  async function scheduleRest(atMs, title, body){
    const LN = P('LocalNotifications'); if(!LN) return;
    try {
      await LN.schedule({notifications:[{id:REST_ID, title, body, channelId:'rest',
        schedule:{at:new Date(Math.max(atMs, Date.now() + 1000)), allowWhileIdle:true}}]});
    } catch(e){}
  }
  async function cancelRest(){
    const LN = P('LocalNotifications'); if(!LN) return;
    try { await LN.cancel({notifications:[{id:REST_ID}]}); } catch(e){}
  }
  function keepAwake(yes){
    const K = P('KeepAwake'); if(!K) return false;
    try { if(yes) K.keepAwake(); else K.allowSleep(); } catch(e){}
    return true;
  }
  // the Android web view cannot download blobs, so write the file and open the share sheet instead
  async function shareFile(name, text){
    const FS = P('Filesystem'), SH = P('Share'); if(!FS || !SH) return false;
    const r = await FS.writeFile({path:name, data:text, directory:'CACHE', encoding:'utf8'});
    await SH.share({title:name, url:r.uri, dialogTitle:name});
    return true;
  }
  return {on, prepare, scheduleRest, cancelRest, keepAwake, shareFile};
})();
