babel src --out-dir dist
browserify --debug dist/js/multi-checkbox-list.js --standalone MultiCheckboxList > dist/multi-checkbox-list.js

cleancss -o dist/multi-checkbox-list.css src/css/*.css