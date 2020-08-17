'use strict'
String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };

const SettingsUI = require('tera-mod-ui').Settings;
const Quests = require("./quests.json");

module.exports = function AutoGuildquest(mod) {

	let myQuestId = 0,
		status = 2,
		progress = 0,
		clr = 0,
		entered = false,
		hold = false,
		daily = 0,
		weekly = 0
	  
	mod.game.me.on('change_zone', (zone, quick) => {
		if (mod.settings.battleground.includes(zone)) {
			hold = true
		} else if (hold && myQuestId !== 0) {
			hold = false
			completeQuest()
			dailycredit()
			CompleteExtra()
		}
	});

//Hook
	mod.game.on('enter_game', () => {daily = weekly = 0})
	mod.hookOnce('S_AVAILABLE_EVENT_MATCHING_LIST', 1, event => {daily = event.unk4weekly = event.unk6})
	mod.hook('S_LOGIN', 'event', () => {mod.hookOnce('S_SPAWN_ME', 'event', () => {setTimeout(dailycredit,1000+ Math.random()*250);});});
	mod.hook('S_FIELD_EVENT_ON_ENTER', 'raw', () => {  entered = true;});
	mod.hook('C_RETURN_TO_LOBBY', 'raw', () => {  entered = false;});
	mod.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, (event) => {
		daily++
		weekly++
		if (mod.settings.Vanguard) {
			myQuestId = event.id
			if (!hold) setTimeout(completeQuest,1000+ Math.random()*250);
		}
	});
	mod.hook('S_FIELD_EVENT_PROGRESS_INFO', 1, () => {if (mod.settings.Guardian) setTimeout(completeGuardian, 2000+ Math.random()*250);});
	mod.hook('S_UPDATE_GUILD_QUEST_STATUS', 1, (event) => {
		if (mod.settings.GQuest) {
			if (event.targets[0].completed == event.targets[0].total) {
				setTimeout(()=>{
				mod.send('C_REQUEST_FINISH_GUILD_QUEST', 1, {quest: event.quest})
				}, 2000 + Math.random()*1000)
				setTimeout(() => {
				mod.send('C_REQUEST_START_GUILD_QUEST', 1, {questId: event.quest})
				}, 4000 + Math.random()*1000)
			}
		}
	})
	mod.hook('S_FIELD_POINT_INFO', 2, (event) => {       
		if(entered && event.cleared != clr && event.cleared - 1 > event.claimed){
			mod.toClient('S_CHAT', 3, {
			channel: 21,
			gm: 1,
			name: 'Guardian Mission',
			message: String(event.cleared + " / 40")
			});}clr = event.cleared;});
/*	 mod.hook("S_GUILD_QUEST_LIST", 1, (event) => {
		if (mod.settings.GQuestLog) {
			GetQuestsInfo(event["quests"]);
		}
	})*/
//Function
	function completeQuest() {
		mod.send('C_COMPLETE_DAILY_EVENT', 1, {id: myQuestId})	
		setTimeout(() => {mod.send('C_COMPLETE_EXTRA_EVENT', 1, {type: 0})
		}, 500+ Math.random()*250)
		setTimeout(() => {mod.send('C_COMPLETE_EXTRA_EVENT', 1, {type: 1})
		}, 1000+ Math.random()*250)
		myQuestId = 0
		if(mod.settings.VLog) report() 
		
	}; 
	function report() {
		if(daily < 16) mod.command.message(niceName + 'Daily Vanguard Requests completed: ' + daily)
		else mod.command.message(niceName + 'You have completed all 16 Vanguard Requests today.')
	}
	function completeGuardian() {
		mod.send('C_REQUEST_FIELD_POINT_REWARD', 1, {})
		setTimeout(() => {
		mod.send('C_REQUEST_ONGOING_FIELD_EVENT_LIST', 1, {})
	}, 2000+ Math.random()*500)
};
	function dailycredit() {
		if (mod.settings.Daily) {
			let _ = mod.trySend('C_REQUEST_RECV_DAILY_TOKEN', 1, {});
			 !_ ? mod.log('Unmapped protocol packet \<C_REQUEST_RECV_DAILY_TOKEN\>.') : null;
		  }
	};
/*	function GetQuestsInfo(questEvent) {
		for (let questIndex in questEvent) {
			if ([1, 2].includes(questEvent[questIndex]["status"])) {
				let qName = questEvent[questIndex]["name"].replace("@GuildQuest:", "");
				let qSize = GetQuestSize(questEvent[questIndex]["size"]);
				let qStatus = `${questEvent[questIndex]["status"] == 1 ? "[ACTIVE]".clr("f1ef48") : "[COMPLETE]".clr("3fce29")}`;
				let qTime = new Date(1000 * questEvent[questIndex]["timeRemaining"]).toISOString().substr(11, 8);
				mod.command.message(`${qStatus} ${Quests[qName].clr("0cccd6")} ${qSize.clr("0c95d4")} Time left: ${qTime.clr("db3dce")}`)
		} else {continue}}} 
	function GetQuestSize(size) {
		if (size == 0) {
			return "(Small)"
		} else if (size == 1) {
			return "(Medium)"
		} else {
			return "(Large)"
		}
	}*/
	function sendMessage(msg) { mod.command.message(msg) }
	let ui = null;
	if (global.TeraProxy.GUIMode) {
		ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { alwaysOnTop: true, width: 550, height: 232 });
		ui.on('update', settings => { mod.settings = settings; });

		this.destructor = () => {
			if (ui) {
				ui.close();
				ui = null;
			}
		};
	}
//Command
	mod.command.add('auto', {
		'VG': () => {
			mod.settings.Vanguard = !mod.settings.Vanguard
			sendMessage("Auto-Vanguardquest: " + (mod.settings.Vanguard ? "On" : "Off"));
		},
		'GQ': () => {
			mod.settings.GQuest = !mod.settings.GQuest
			sendMessage("Auto-Guildquest: " + (mod.settings.GQuest ? "On" : "Off"));
		},
		'GL': () => {
			mod.settings.Guardian = !mod.settings.Guardian
			sendMessage("Auto-Gardian-Legion: " + (mod.settings.Guardian ? "On" : "Off"));
		},
		'DC': () => {
			mod.settings.Daily = !mod.settings.Daily
			sendMessage("Auto-Daily-Credit: " + (mod.settings.Daily ? "On" : "Off"));
		},
		'VGLog': () => {
			mod.settings.VLog = !mod.settings.VLog
			sendMessage("Vanguard-Quest Logger: " + (mod.settings.VLog ? "On" : "Off"));
		},
		'UI': () => {
			ui.show();
		},
		'$default': () => {
			sendMessage(`Invalid argument. usasge command with 'auto'`),
			sendMessage(`UI | Show the ui setting`),
			sendMessage(`VQ | Auto-Vanguard`),
			sendMessage(`GQ | Auto-GuildQuest with relaunch`),
			sendMessage(`VGLog |Vanguard-Quest-Logger`),
			sendMessage(`GL |Auto claim box in Gardian legion`),
			sendMessage(`DL |Auto claim Daily cradit `);
		}
	});
	}


	


