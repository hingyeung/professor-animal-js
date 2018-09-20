const errorHandler = (agent, err) => {
    console.log(err);
    agent.end("Something is broken on my side. Sorry for leaving you like this. Bye.");
};

module.exports = errorHandler;