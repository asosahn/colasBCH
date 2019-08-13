var amqp = require('amqplib/callback_api');

amqp.connect('amqp://docker.for.mac.host.internal', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  const i = 1;
  // for(let i=0; i<=2; i++) {
      connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }
        var queue = 'task_queue';
    
        channel.assertQueue(queue, {
          durable: true
        });
        channel.prefetch(1);
        console.log(` [${i}] Esperando mensaje en cola ${queue}, Presione CTRL+C para salir`);
        channel.consume(queue, function(msg) {
          var secs = msg.content.toString().split('.').length - 1;
    
          console.log(` [${i}] Recibida ${msg.content.toString()}`);
        //   console.log(JSON.parse(msg.content.toString()).name);
          setTimeout(function() {
            console.log(` [${i}] Procesada -------`);
            channel.ack(msg);
          }, secs * 1000);
        }, {
          // manual acknowledgment mode,
          // see https://www.rabbitmq.com/confirms.html for details
          noAck: false
        });
      });
  // }
});