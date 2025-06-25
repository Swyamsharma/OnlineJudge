import amqp from 'amqplib';

let channel = null;

export const connectRabbitMQ = async (io) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost:5672');
        channel = await connection.createChannel();
        console.log('[API Server] Connected to RabbitMQ.');
        
        const exchange = process.env.RESULT_EXCHANGE || 'results_exchange';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        console.log('[API Server] Consumer is waiting for messages from the results exchange.');

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const { submissionId, userId, verdict } = JSON.parse(msg.content.toString());

                console.log(`[WebSocket Server] Received result for user ${userId}. Broadcasting verdict: ${verdict}`); 
                
                io.to(userId.toString()).emit('submission:update', { _id: submissionId, verdict });
            }
        }, { noAck: true });
    } catch (error) {
        console.error("RabbitMQ connection failed, retrying in 5s", error);
        setTimeout(() => connectRabbitMQ(io), 5000);
    }
};

export const getChannel = () => {
    if (!channel) throw new Error("RabbitMQ channel not available!");
    return channel;
};