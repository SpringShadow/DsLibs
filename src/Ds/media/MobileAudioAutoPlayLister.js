/**
 * @class Ds.media.MobileAudioAutoPlayList
 * @classdesc:类说明: 解决初始化声音播放问题，在微信下可以通过微信WeixinJSBridgeReady事件来初始化声音播放，其他情况下第一次touch事件时候处理触发播放
 * @extends
 * @example:
 *
 ========javascript==========
 _MobileAudioAutoPlayLister=new Ds.media.MobileAudioAutoPlayLister();
 _MobileAudioAutoPlayLister.InitLoadAndSetBGM({
   //加载声音列表
   list:[
     {src:'./media/BGM.mp3',id:'BGM',loop:true}
   ],
   //默认播放声音背景
   id:'BGM',
   //这个BMG 绑定的控制的按钮
   button:'#BGMBtn'
 });

 ========HTML ==========
 <!-- 音乐播放按钮HTML格式 -->
 <div id="BGMBtn">
   <div class="on"></div>
   <div class="off"></div>
 </div>
 * @author: maksim email:maksim.lin@foxmail.com
 * @copyright:  Ds是累积平时项目工作的经验代码库，不属于职位任务与项目的内容。里面代码大部分理念来至曾经flash 前端时代，尽力减小类之间耦合，通过webpack按需request使用。Ds库里内容多来至网络与参考其他开源代码库。Ds库也开源开放，随意使用在所属的职位任务与项目中。
 * @constructor
 **/
(function (factory) {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            module.exports= factory(root, exports);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports=factory(root, exports);
    } else {
         factory(root, {});
    }

}(function (root, modelObj) {
  root.Ds = root.Ds || {};
  root.Ds.media=root.Ds.media||{};
  //声音索引字典
  // root.AudioDc=root.AudioDc||{};
  root.Ds.media.MobileAudioAutoPlayLister=MobileAudioAutoPlayLister;
  function MobileAudioAutoPlayLister(){
    var _Self=this;
    //声音索引字典
    var _AudioDc={};
    Object.defineProperty(this, "AudioDc", {
        get: function() {return _AudioDc;},
    });
    /**
     * 加载声音队列，并且播放第一个BGM,设置BGM按钮
     * @param {[Object]} opts [初始化参数]
     * opts.list=[
       {src:'./media/BGM.mp3',id:'BGM',loop:true}
      ]
      opts.id='BGM'
      opts.button='#BGMBtn'
     */
    this.InitLoadAndSetBGM=function(opts){
      if(opts.list===undefined||opts.list===null)return;
      if(opts.list.length<=0)return;
      var _list=opts.list;
      var _id=opts.id;
      _Self.LoadAudioListAndFirstAutoPlay(_list,_id);
      if(opts.button!==undefined){
        var _audio=_AudioDc[_id];
        _Self.SetBMGButton(_audio,opts.button);
      }
    };
    /**
     * 加载默认初始化播放声音的队列,并播放第一个声音
     * @param {[Array]} list [加载的声音列表队列]
     * [
     * {src:'./media/BGM1.mp3',id:'BGM1',loop:true},
     * {src:'./media/BGM2.mp3',id:'BGM2',loop:true},
     * ]
     */
    this.LoadAudioListAndFirstAutoPlay=function(list,firstPlayID){
      //判断微信兼容
      var _isWeixin = false;
      var ua = navigator.userAgent.toLowerCase();
      if (ua.match(/MicroMessenger/i) == "micromessenger") _isWeixin = true;
      //需要初始化声音播放的列表
      var _audioList=[];
      for (var i = 0; i < list.length; i++) {
        var _obj=list[i];
        var _tempAudio=new Audio();
        _obj.audio=_tempAudio;
        _tempAudio.autoplay=_obj.autoplay===undefined?false:_obj.autoplay;
        _tempAudio.loop=_obj.loop===undefined?true:_obj.loop;
        _tempAudio.src=_obj.src;
        if(_obj.id)_AudioDc[_obj.id]=_tempAudio;
        _tempAudio.volume=0;
        _audioList.push(_tempAudio);
      }
      //判断声音是否不初始化播放过
      var _InitBool=false;
      //微信下自动播放声音判断
      if(_isWeixin){
        // $('#debug').html('是微信')
        if (typeof WeixinJSBridge == "undefined"){
          //  $('#debug').html('WeixinJSBridge undefined')
          document.addEventListener("WeixinJSBridgeReady", function func() {
            _InitBool=true;
            for (var i = 0; i < _audioList.length; i++) {
                var _tempAudio=_audioList[i];
                _tempAudio.play();
                // _tempAudio.volume=1;
                // _tempAudio.pause();
            }
            if(_AudioDc[firstPlayID]){
              _AudioDc[firstPlayID].volume=1;
            }
            setTimeout(function(){pauseOtherAudio();},100);
          }, false);
        }else{
          //如果这个视频在是后创建交互视频对象，那就不能通过WeixinJSBridgeReady来触发视频播放 就不会有canplay，需要通过第一次touchstar；
          // $('#debug').html('WeixinJSBridge OK'+WeixinJSBridge)
          document.body.addEventListener('touchstart', audioInBrowserHandler);
        }
      }else{
        // $('#debug').html('非微信')
        // console.log('非微信');
        initAudioPlay();
      }
      //暂停那些不需要初始化播放的声音
      function pauseOtherAudio(){
        for (var i = 0; i < _audioList.length; i++) {
            var _tempAudio=_audioList[i];
            if(_AudioDc[firstPlayID]!==_tempAudio){
              _tempAudio.volume=1;
              _tempAudio.pause();
            }
        }
      }
      //初始化播放声音
      function initAudioPlay(){
        console.log('非微信',_audioList.length);
        if(_InitBool)return;
        _InitBool=true;
        for (var i = 0; i < _audioList.length; i++) {
            var _tempAudio=_audioList[i];
            _tempAudio.play();
            // _tempAudio.volume=1;
            // _tempAudio.pause();
        }
        if(_AudioDc[firstPlayID]){
          _AudioDc[firstPlayID].volume=1;
        }
        setTimeout(function(){pauseOtherAudio();},100);
      }
      //需要第一次touch 来执行播放
      function audioInBrowserHandler(){
        initAudioPlay();
        document.body.removeEventListener('touchstart', audioInBrowserHandler);
      }
    };

    this.SetBMGButton=function(audio,button){
      //声音对象
      var _audio=audio;
      //监听声音对象事件
      _audio.addEventListener("play", function(){
        upUIState();
      });
      _audio.addEventListener("pause", function(){
        upUIState();
      });
      //按钮设置
      var _button=$(button);
      _button.on('click',function(){
        if(_audio.paused)_audio.play();
        else _audio.pause();
      });
      //声音按钮状态update
      function upUIState(){
        if(_button){
          if(_audio.paused){
            _button.find('.on').hide();
            _button.find('.off').show();
          }
          else{
            _button.find('.on').show();
            _button.find('.off').hide();
          }
        }
      }
      //重置UI状态
      upUIState();
    };
  }

  return root.Ds.media.MobileAudioAutoPlayLister;
}));
