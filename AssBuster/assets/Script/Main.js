// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

window.Global = {
    endIndex: 0,
    enemyHp:1,
    playerHp:1,
    powerUpFlag:false
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        textWindow:{
            default: null,
            type: cc.Prefab
        },
        bullet:{
            default: null,
            type: cc.Prefab
        },
        bulletCreatePeriod:0,
        player:{
            default: null,
            type: cc.Node
        },
        enemy:{
            default: null,
            type: cc.Node
        },
        playerHp:{//TODO
            default: null,
            type: cc.Node
        },
        playerDmgRate:0,
        enemyHp:{//TODO
            default: null,
            type: cc.Node
        },
        enemyDmgRate:0,
        enemyPowerUpRate:0,
        enemyHitDistance:0,
        enemyCriticalHitDistance:0
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        //this.spawnNewBullet();
        this.bulletPool = new cc.NodePool();
        this.bulletCreateCount = 0;
        this.enemy.getComponent('Enemy').main = this;
    },

    start () {
        if (Global.powerUpFlag) {
            this.enemyHp.getComponent(cc.ProgressBar).progress = Global.enemyHp;
            this.playerHp.getComponent(cc.ProgressBar).progress = Global.playerHp;
            this.enemy.getComponent("Enemy").moveSpeed *=2;
            this.bulletCreatePeriod /=2;
            this.bulletCreateCount = 0;
        }
    },

    update (dt) {
        if( this.bulletCreateCount == this.bulletCreatePeriod){
            this.createBullet();
            this.bulletCreateCount = 0;
        } else {
            this.bulletCreateCount++;
        }

        // 根据 Player 节点位置判断距离
        var playerPos = this.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.enemy.getPosition().sub(playerPos).mag();
        if ( dist < this.enemyHitDistance ) {
            var delX = Math.abs(this.enemy.x - this.player.x);
            this.changeEnemyHp(delX);
        }
      
    },

    createBullet: function () {
        let bullet = null;
        if (this.bulletPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            bullet = this.bulletPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            bullet = cc.instantiate(this.bullet);
            bullet.getComponent('Bullet').main = this;
        }
        bullet.parent = this.node; // 将生成的敌人加入节点树
        bullet.setPosition(this.getNewBulletPosition());
    },

    getNewBulletPosition: function () {
        // 返回星星坐标
        return cc.v2(this.enemy.x, this.enemy.y - this.enemy.height);
    },

    changePlayerHp: function(){
        if( !this.player.getComponent("Player").nodamageFlag ){
            this.player.getComponent("Player").setblinkSec(3);
            let bar = this.playerHp.getComponent(cc.ProgressBar);
            bar.progress -= this.playerDmgRate;
            if( bar.progress <= 0 ){
                cc.director.loadScene("end");
            }
        }
    },

    changeEnemyHp: function(delX){
        var enemy = this.enemy.getComponent("Enemy");
        if( !enemy.nodamageFlag ){
            enemy.setblinkSec(3);
            let bar = this.enemyHp.getComponent(cc.ProgressBar);
            bar.progress -= this.enemyDmgRate * (delX < this.enemyCriticalHitDistance ? 1:0.5);
            if( bar.progress <= 0 ){
                Global.endIndex = 1;
                cc.director.loadScene("end");
            } else if ( bar.progress <= this.enemyPowerUpRate && !Global.powerUpFlag) {
                //this.node.emit("pause");
                //this.node.dispatchEvent( new cc.Event.EventCustom('pause', true) );
                /*
                this.pauseFlag = true;
                this.enemy.getComponent("Enemy").pauseFlag = true;
                this.player.getComponent("Player").pauseFlag = true;
                var children = this.node.children;
                */

                /*
                this.myTextWindow = cc.instantiate(this.textWindow);
                this.node.addChild(this.myTextWindow); // 将生成的敌人加入节点树
                var testStory = ["asdasd","qweqwe"];
                this.myTextWindow.getComponent("TextWindow").setup(testStory, () => {this.node.emit("resume");});
                */
                Global.enemyHp = bar.progress;
                Global.powerUpFlag = true;
                cc.director.loadScene("powerup");
            }
        }
    }
});
