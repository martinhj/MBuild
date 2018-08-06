## Do I need following to catch rest of exceptions?

```javascript
process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});
```

(https://stackoverflow.com/questions/32719923/#answer-35542360)

