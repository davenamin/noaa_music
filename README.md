## playing around with NOAA data and WebAudio ##

This was an old weekend experiment to try to write an app with Node.js
and Express. It's not very good and needs love / someone who knows how
to write proper web code.

### getting started using [Glitch](https://glitch.com) ###
[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/davenamin/noaa_music)

### getting started locally###
- install Node.js [LTS, maybe 6.10.x](https://nodejs.org/en/download/)
- clone this repo
- run "npm install" in base of repo
- run "npm start" and navigate to http://localhost:3000

I've noticed that killing the webserver doesn't always end the process
(so Node / Express will complain about not being able to reuse port
3000) on Windows. So after CTRL-Cing from the server, consider using
the Task Manager to kill any lingering Node.js processes.
