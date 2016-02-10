# Metricador Express middleware
A simple middleware for the Express framework that is backed by the Metricador library. This middleware enables you
to add response time monitoring to an Express Node.js app within minutes, and to be able to plot the resulting data
to a supported metric database. At the moment only Graphite is supported, others coming soon :-). If you don't have a supported
backend you can visualize the data from the console log with no extra configuration.

## How to use it
```javascript
var metricador_middleware = require('metricador-express-middleware');

var app = express();

app.use(metricador_middleware({namespace: 'your-own-namespace'}));
```

# License
[MIT](https://github.com/ovidiubute/metricador-express-middleware/blob/master/LICENSE)
