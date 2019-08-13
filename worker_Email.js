var amqp = require("amqplib/callback_api");
var https = require("https");
const axios = require("axios");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const EMAILURI = process.env.EMAILURL || "https://localhost:7001/api/email";
const QUEUEURI = process.env.QUEUEURI || "https://localhost:7001/api/queue";
console.log(EMAILURI);
console.log(QUEUEURI);

amqp.connect("amqp://docker.for.mac.host.internal", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  
  const i = 1;
  // for(let i=0; i<=2; i++) {
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = "queue_email";

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(
      ` [${i}] Esperando mensaje en cola ${queue}, Presione CTRL+C para salir`
    );
    channel.consume(
      queue,
      function(msg) {
        const agent = new https.Agent({  
            rejectUnauthorized: false
          })
        
        const message = JSON.parse(msg.content.toString());
        axios
          .post(EMAILURI, message, {config: { httpsAgent: agent }} )
          .then(response => {
            console.log(`Mensaje Enviado ${msg.content.toString()}`);
            channel.ack(msg);
          })
          .catch(err => {
            console.log("Error", err.message);
            channel.ack(msg);
            // const composeData = {
            //   name: queue,
            //   message: message
            // };
            // axios.post(QUEUEURI, composeData, {config: { httpsAgent: agent }} )
            // .then(() => {
            //     console.log("Encolado");
            //     channel.ack(msg);
            // })
            // .catch(err => {
            //     console.log("Error", err.message);
            //     channel.ack(msg);
            //  });
          });
      },
      {
        // manual acknowledgment mode,
        // see https://www.rabbitmq.com/confirms.html for details
        noAck: false
      }
    );
  });
  //   }
});
