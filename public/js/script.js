"use strict";

import {router} from "./modules/router.mjs";
import {createMenu} from "./pages/menu.mjs";
import {createSignUp} from "./pages/signup.mjs";
import {createLogin} from "./pages/login.mjs";
import {createLeaderboard} from "./pages/leaderboard.mjs";
import {createAbout} from "./pages/about.mjs";
import {createProfile} from "./pages/profile.mjs";
import {AjaxModule} from "./modules/ajax.mjs";

/**
 * @function logoutUser - Action that clears session-id and logges user out
 */
function logoutUser() { // TODO в отдельный модуль по работе с юзером
	AjaxModule.doDelete({path: "/session"})
		.then(resp => {
			if (resp.status === 200) {
				router.open("menu");
			} else {
				return Promise.reject(new Error(resp.status));
			}
		})
		.catch(err => {
			router.open("menu");
		});
}

/**
 * @function main - Starts the application
 */
function main() {
	router
		.add("menu", "/", createMenu)
		.add("signup", "/signup", createSignUp)
		.add("login", "/login", createLogin)
		.add("leaderboard", "/leaderboard", createLeaderboard)
		.add("about", "/about", createAbout)
		.add("profile", "/profile", createProfile)
		.add("logout", "/logout", logoutUser);

	let path = window.location.pathname;
	let desiredPage = router.getNameByPath(path);

	if (desiredPage !== null) {
		router.open(desiredPage);
	} else {
		router.open();
	}
}

main();