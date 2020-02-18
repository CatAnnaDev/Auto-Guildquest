const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function AutoGuildquest(mod) {

	let myQuestId = 0,
		status = 2,
		progress = 0,
		clr = 0,
		entered = false,
		hold = false
	  
	mod.game.me.on('change_zone', (zone, quick) => {
		if (mod.settings.battleground.includes(zone)) {
			hold = true
		} else if (hold && myQuestId !== 0) {
			hold = false
			completeQuest()
			dailycredit()
		}
	});
//thx Kygas 
/*	mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        const msg = mod.parseSystemMessage(event.message);
        if (msg) {
              console.log(msg);
        }
	}); */

//Daily
	mod.hook('S_LOGIN', 'event', () => {
		mod.hookOnce('S_SPAWN_ME', 'event', () => {
			setTimeout(dailycredit,1000+ Math.random()*250);
		});
	});
//Guardian
	mod.hook('S_FIELD_EVENT_ON_ENTER', 'raw', () => {  
		entered = true;
		//return false;
	});
//Guardian
	mod.hook('C_RETURN_TO_LOBBY', 'raw', () => {  
		entered = false;
	});
//Vandguard	
	mod.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, (event) => {
		if (mod.settings.Vanguard) {
			myQuestId = event.id
			if (!hold) setTimeout(completeQuest,1000+ Math.random()*250);
			//return false;
		}
	});
//Guardian
	mod.hook('S_FIELD_EVENT_PROGRESS_INFO', 1, () => {
		if (mod.settings.Guardian) setTimeout(completeGuardian, 2000+ Math.random()*250);
	});
//Gquest
mod.hook('S_UPDATE_GUILD_QUEST_STATUS', 1, (event) => {
	if (mod.settings.GQuest) {
		if (event.targets[0].completed == event.targets[0].total) {
			setTimeout(()=>{
			mod.send('C_REQUEST_FINISH_GUILD_QUEST', 1, {
				quest: event.quest
			})
			sendMessage('finish: ' + event.quest)
			}, 2000 + Math.random()*1000)
			
			setTimeout(() => {
				mod.send('C_REQUEST_START_GUILD_QUEST', 1, {
					questId: event.quest
				})
				sendMessage('launch: ' + event.quest)
			}, 4000 + Math.random()*1000)
		}
		//return false;
	}
})
//Guardian
	mod.hook('S_FIELD_POINT_INFO', 2, (event) => {       
		if(entered && event.cleared != clr && event.cleared - 1 > event.claimed)
		{
			mod.toClient('S_CHAT', 3, {
			channel: 21,
			gm: 1,
			name: 'Guardian Mission',
			message: String(event.cleared + " / 40")
			});
		}
		clr = event.cleared;
	});
//Vanguard
	function completeQuest() {
		mod.send('C_COMPLETE_DAILY_EVENT', 1, {
			id: myQuestId
		})
		setTimeout(() => {
			mod.send('C_COMPLETE_EXTRA_EVENT', 1, {
				type: 0
			})
		}, 500+ Math.random()*250)
		setTimeout(() => {
			mod.send('C_COMPLETE_EXTRA_EVENT', 1, {
				type: 1
			})
		}, 1000+ Math.random()*250)
		myQuestId = 0
	};
//Guardian
	function completeGuardian() {
		mod.send('C_REQUEST_FIELD_POINT_REWARD', 1, {
		})
		setTimeout(() => {
			mod.send('C_REQUEST_ONGOING_FIELD_EVENT_LIST', 1, {
			})
		}, 2000+ Math.random()*500)
};
//Daily
	function dailycredit() {
		if (mod.settings.Daily) {
			let _ = mod.trySend('C_REQUEST_RECV_DAILY_TOKEN', 1, {});
			 !_ ? mod.log('Unmapped protocol packet \<C_REQUEST_RECV_DAILY_TOKEN\>.') : null;
		  }
	};
//Msg
function sendMessage(msg) { mod.command.message(msg) }
//Ui
let ui = null;
if (global.TeraProxy.GUIMode) {
	ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { alwaysOnTop: true, width: 550, height: 200 });
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
	'UI': () => {
		ui.show();
	  },
	'$default': () => {
		sendMessage(`Invalid argument. usasge : auto [VG|GQ|RL|GL|DC]`);
	}
  });
}


	


