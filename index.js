module.exports = function AutoGuildquest(mod) {
	let myQuestId = 0,
		status = 2,
		hold = false
		
	mod.command.add("AVQ", () => {
		mod.settings.enabledV = !mod.settings.enabledV
		sendMessage("Auto-Vanguardquest: " + (mod.settings.enabledV ? "On" : "Off"))
	})

	mod.command.add("AGQ", () => {
		mod.settings.enabledG = !mod.settings.enabledG
		sendMessage("Auto-Guildquest: " + (mod.settings.enabledG ? "On" : "Off"))
	})

	mod.command.add("ARGQ", () => {
		mod.settings.auto = !mod.settings.auto
		sendMessage("Auto-Relaunch-Guildquest: " + (mod.settings.auto ? "On" : "Off"))
	})
	
	mod.game.me.on('change_zone', (zone, quick) => {
		if (mod.settings.battleground.includes(zone)) {
			hold = true
		} else if (hold && myQuestId !== 0) {
			hold = false
			completeQuest()
			completeGuildQuest()
		}
	})
	
	mod.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, (event) => {
		if (mod.settings.enabledV) {
			myQuestId = event.id
			if (!hold) completeQuest()
			return false
		}
	})

	mod.hook('S_UPDATE_GUILD_QUEST_STATUS', 1, (event) => {
		if (mod.settings.enabledG) {
			 completeGuildQuest()
			return false
		}
	})
	
	function completeGuildQuest() {
		if (event.targets[0].completed == event.targets[0].total) {
            mod.send('C_REQUEST_FINISH_GUILD_QUEST', 1, {
                quest: event.quest
            })
            if (mod.settings.auto) {
            mod.setTimeout(() => {
                mod.send('C_REQUEST_START_GUILD_QUEST', 1, {
                    questId: event.quest
                })
            }, 3000)
		}
		}
	}

	function completeQuest() {
		mod.send('C_COMPLETE_DAILY_EVENT', 1, {
			id: myQuestId
		})
		try {
			setTimeout(() => {
				mod.send('C_COMPLETE_EXTRA_EVENT', 1, {
					type: 0
				})
			}, 500)
			setTimeout(() => {
				mod.send('C_COMPLETE_EXTRA_EVENT', 1, {
					type: 1
				})
			}, 500)
		} catch (e) {
			
		}
		myQuestId = 0
	}
	function sendMessage(msg) { mod.command.message(msg) }
}
