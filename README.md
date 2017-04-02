## playing around with NOAA data and WebAudio ##

### getting started ###
- install Node.js [LTS, maybe 6.10.x](https://nodejs.org/en/download/)
- clone this repo
- run "npm install" in base of repo
- run "npm start" and navigate to http://localhost:3000

I've noticed that killing the webserver doesn't always end the process 
(so Node / Express will complain about not being able to reuse port 3000) 
on Windows. So after CTRL-Cing from the server, consider using the Task 
Manager to kill any lingering Node.js processes.