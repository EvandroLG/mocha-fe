JSHINT=./node_modules/jshint/bin/jshint

.SILENT:

run:
	node index.js

jshint:
	$(JSHINT) *.js **/*.js