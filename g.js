/**
*	卡片
*/
function Card(value,id,isFront,isShow,special){
	if(value==null||value == undefined||value==''){
		this.value='A';
	}else{
		this.value = value;
	}
	if(/^[0-9]{1,}$/.test(id)){
          this.id=id;
    }
	if(isFront==null||isFront == undefined||isFront==''){
		this.isFront=false;
	}else{
		this.isFront = isFront;
	}
	if(isShow==null||isShow == undefined||isShow==''){
		this.isShow=true;
	}else{
		this.isShow = isShow;
	}
	if (special==null||special == undefined||special=='') {
		this.isSpecial=false;
		this.special=null;
	}else {
		this.isSpecial=true;
		this.special = special;
	}
}
//打开
Card.prototype.open = function(){
	this.isFront=true;
}
//关闭
Card.prototype.close = function(){
	this.isFront=false;
}
//隐藏
Card.prototype.hide = function(){
	this.isShow=true;
}
//显示
Card.prototype.show = function(){
	this.isFront=true;
}
//设置特殊属性
Card.prototype.setSpecial=function(special){
	if (special==null||special == undefined||special=='') {
		this.isSpecial=false;
		this.special=null;
	}else {
		this.isSpecial=true;
		this.special = special;
	}
}
//获得状态
Card.prototype.getStatus = function(){
	//如果显示
	if (this.isShow) {
		return this.isFront?"1":"0";
	}
	return "2";
}
/**
*   平面
*/
function Plane(){
     this.cardArray=[];
     this.x=4;
     this.y=5;
     this.kind=10;
	 //相同卡片的消失个数
	 this.pass=2;
} 
//生成待添加卡片
Plane.prototype.generateCard=function(x,y,kind,pass){
     var cardList=[];
     //A
     var cardValue=65;
     if(!/^[0-9]{1,}$/.test(x)){
          x=4;
     }
     if(!/^[0-9]{1,}$/.test(y)){
          y=5;
     }
     if(!/^[0-9]{1,}$/.test(kind)){
          kind=10;
     }
	 if(!/^[0-9]{1,}$/.test(pass)){
          pass=2;
     }
     x=x<1?1:x;
     y=y<1?1:y;
	 pass=x*y<pass?x*y:pass;
	 pass=pass<2?2:pass;
     //重置不同的卡片数
     kind=kind<1?1:kind>64?64:kind;
     kind=Math.floor(x*y/pass)>kind?kind:Math.floor(x*y/pass);
	 this.x=x;this.y=y;this.kind=kind;this.pass=pass;
     //如果不是成对出现
	 var passLeft=x*y%pass;
     for (var i=0;i<passLeft;i++) {
          cardList.push(new Card("@",i));
     }
     //每种卡片能出现几对
     var n=Math.floor(x*y/pass/kind);
     //第几种卡片之前额外增加一对
     var k=Math.floor(x*y/pass)%kind;
	 var cc=0;
     for (var i = 0; i < kind; i++) {
          var nc=cardValue+i;
          //判断最终有几对
          var m=i<k?n+1:n;
          for (var j = 0; j < m*pass; j++) { 
               cardList.push(new Card(String.fromCharCode(nc),cc+passLeft));
			   cc++;
          }
     }
     return cardList;
}
//随机获得一个卡片
Plane.prototype.getCard=function(cardList){
     if (cardList==null||cardList==undefined||cardList.length<=0) {
          return null;
     }
     var i=Math.floor(Math.random()*cardList.length);
     var card=cardList[i];
     cardList.splice(i,1);
     return card;
}
//初始化 列数 行数 种类数 消失相同卡片个数
Plane.prototype.init=function(x,y,kind,pass){
     if(/^[0-9]{1,}$/.test(x)){
          this.x=x;
     }else{
          this.x=4;
     }
     if(/^[0-9]{1,}$/.test(y)){
          this.y=y;
     }else{
          this.y=5;
     }
     if(/^[0-9]{1,}$/.test(kind)){
          this.kind=kind;
     }else{
          this.kind=10;
     }
	if(/^[0-9]{1,}$/.test(pass)){
          this.pass=pass;
     }else{
          this.pass=2;
     }
     var cardList=this.generateCard(this.x,this.y,this.kind,this.pass);
	 //console.log(cardList);
     for (var i = 0; i < this.y; i++) {
          this.cardArray[i]=[];
          for (var j = 0; j < this.x; j++) {
               this.cardArray[i][j]=this.getCard(cardList);
          }
     }
     //this.print(this.cardArray);
}
//打印输出
Plane.prototype.print=function(cardArray){
	if(cardArray==null||cardArray==undefined||!(cardArray instanceof Array)){
		cardArray=this.cardArray;
	}
    for (var i = 0; i < cardArray.length; i++) {     
          var alist=cardArray[i];
		  var str="";
          for (var j = 0; j < alist.length; j++) {
               var c=cardArray[i][j];
               //展示渲染
               var s=c.getStatus()=="2"?" ":c.getStatus()=="0"?"*":c.value;
               //var s=c.value;
			   str=str+s+"\t";
          }
          console.log(str);
     }
     console.log("----------------------------");
}
/**
* 规则
*/
function Rule(){
	this.clickList=[];
	this.okList=[];
	//完成卡片数
	this.okCount=0;
	//总卡片数 
	this.allCount=0;
	// 点击次数
	this.clickCount=0;
	//开始时间
	this.startTime=0;
	//结束时间
	this.endTime=0;
	//打开延时时间
	this.openTime=500;
	//是否可以点击
	this.canClick=true;
	//特效次数
	this.specialCount=0;
}
//点击 -2 异常 -1 卡片重复点击 0 正常点击 1 选择成功 2 匹配成功 3 匹配失败 4 全部选中结束 | - + 上下 左右 180旋转 
Rule.prototype.click=function(x,y){
	if(!/^[0-9]{1,}$/.test(x)||x<0){x=0;}
	if(!/^[0-9]{1,}$/.test(y)||y<0){y=0;}
	if(this.canClick==false||this.plane==undefined||this.plane==null||this.plane.cardArray[y]==undefined||this.plane.cardArray[y][x]==undefined||!(this.plane.cardArray[y][x] instanceof Card)||this.plane.cardArray[y][x].value=="@"){return -2;}
	this.canClick=false;
	//开始
	if(this.clickCount==0){this.start();}
	var c=this.plane.cardArray[y][x];
	var l=this.clickList.length;
	//打开卡片
	c.open();
	for(var i=0;i<this.okList.length;i++){
		if(this.okList[i].card.id==c.id&&this.okList[i].card.value==c.value){this.canClick=true;return -1;}
	}
	if(l==0){this.clickList.push(new Item(x,y,c));this.clickCount++;this.canClick=true;return 1;}
	for(var i=0;i<l;i++){
		if(this.clickList[i].card.id==c.id&&this.clickList[i].card.value==c.value){this.canClick=true;return -1;}
		//延时关闭
		if(this.clickList[i].card.value!=c.value){
			this.clickList.push(new Item(x,y,c));
			this.clickCount++;
			setTimeout(function(rule) {rule.canClick=true;rule.close();rule.refresh();}, this.openTime,this);
			return 3;
		}
	}
	this.clickList.push(new Item(x,y,c));
	this.clickCount++;
	this.canClick=true;
	//匹配成功
	if(this.clickList.length>=this.plane.pass){
		this.okCount+=this.clickList.length;
		this.okList=this.okList.concat(this.clickList);
		console.log(this.okList);
		this.clickList=[];
		//全部匹配成功
		if(this.okCount>=this.allCount){endTime=new Date().getTime(); this.canClick=false; return 4;}
		//单次匹配成功
		return 2;
	}
	//选择成功
	return 1;
	
}
//所有点击的图片关闭
Rule.prototype.close=function(){
	//console.log(this.clickList);
	var l=this.clickList.length;
	if(l<=0){return;}
	for(var i=0;i<l;i++){
		if(this.clickList[i] instanceof Item&&this.clickList[i].card instanceof Card){
			//卡片关闭
			this.clickList[i].card.close();
			//执行特殊属性
			if(this.clickList[i].card.isSpecial==true){
				if(this.clickList[i].card.special=="|"){this.rotateUpDown();this.specialCount++;}
				if(this.clickList[i].card.special=="-"){this.rotateLeftRight();this.specialCount++;}
				if(this.clickList[i].card.special=="+"){this.rotate180();this.specialCount++;}
			}
		}
	}
	this.clickList=[];
}
//开始
Rule.prototype.start=function(){
	startTime=new Date().getTime();
}
//左右旋转
Rule.prototype.rotateLeftRight=function(){
	plane=this.plane;
	if(plane==undefined||plane==null||!(plane instanceof Plane)||plane.cardArray.length<=0){return;}
	var tranArray=[];
	var x=plane.cardArray[0].length;
	var y=plane.cardArray.length;
	for(var i=0;i<y;i++){
		tranArray[i]=[];
		for(var j=0;j<x;j++){
			tranArray[i][j]=cardArray[i][x-j-1];
		}
	}
	plane.cardArray=tranArray;
}
//上下旋转
Rule.prototype.rotateUpDown=function(){
	plane=this.plane;
	if(plane==undefined||plane==null||!(plane instanceof Plane)||plane.cardArray.length<=0){return;}
	var tranArray=[];
	var x=plane.cardArray[0].length;
	var y=plane.cardArray.length;
	for(var i=0;i<y;i++){
		tranArray[i]=[];
		for(var j=0;j<x;j++){
			tranArray[i][j]=cardArray[y-i-1][j];
		}
	}
	plane.cardArray=tranArray;
}
//旋转180度
Rule.prototype.rotate180=function(){
	plane=this.plane;
	if(plane==undefined||plane==null||!(plane instanceof Plane)||plane.cardArray.length<=0){return;}
	var tranArray=[];
	var x=plane.cardArray[0].length;
	var y=plane.cardArray.length;
	for(var i=0;i<y;i++){
		tranArray[i]=[];
		for(var j=0;j<x;j++){
			tranArray[i][j]=cardArray[y-i-1][x-j-1];
		}
	}
	plane.cardArray=tranArray;
}
//打印输出
Rule.prototype.print=function(){
	this.plane.print();
}
//刷新显示
Rule.prototype.refresh=function (){
		var cardArray=this.plane.cardArray;
		var show='';
		if(cardArray==null||cardArray==undefined||!(cardArray instanceof Array)){
			$('#g').html(show);
			return;
		}
		var x=cardArray[0].length;
		var dw=$("#g").width();
		//卡片宽
		var cw=dw*0.9/x;
		//卡片高
		var ch=cw;
		var cdiv='<div class="card" style="border:solid 1px #b4b4b4;text-align:center;float:left;width:'+cw+'px;height:'+ch+'px;"';
		for (var i = 0; i < cardArray.length; i++) {     
			  var alist=cardArray[i];
			  var str="";
			  for (var j = 0; j < alist.length; j++) {
				   var c=cardArray[i][j];
				   //展示渲染
				   var s=c.getStatus()=="2"?" ":c.getStatus()=="0"?"*":c.value;
				   show=show+cdiv+'x='+j+' y='+i+'><span>'+s+'</span></div>'
			  }
		 }
		 $('#g').html(show);
	}
//初始化
Rule.prototype.init=function(x,y,kind,pass,openTime){
	this.plane=new Plane;
	//平面初始化
	this.plane.init(x,y,kind,pass);
	var p=this.plane;
	this.okCount=p.x*p.y%p.pass;
	this.allCount=p.x*p.y;
	this.clickCount=0;
	this.startTime=0;
	this.endTime=0;
	if(/^[0-9]{1,}$/.test(openTime)&&x>0){this.openTime=openTime;}
	this.specialCount=0;
	this.canClick=true;
	this.okList=[];
	this.clickList=[];
}

/**
* 点击按钮存储对象
* 行 列 卡片
*/
function Item(x,y,card){
	if(!/^[0-9]{1,}$/.test(x)||x<0){
          this.x=0;
     }else{
		 this.x=x;
	 }
	 if(!/^[0-9]{1,}$/.test(y)||y<0){
          this.y=0;
     }else{
		 this.y=y;
	 }
	 if(card instanceof Card){
		 this.card=card;
	 }
}

