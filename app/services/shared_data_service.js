class SharedDataService {
    constructor() {
        this.repo = {
            currentGameId: undefined
        };
    }

    get currentGameId() {
        return this.repo.currentGameId;
    }
    
    set currentGameId(gameId) {
        this.repo.currentGameId = gameId;
    }
}

const sharedDataService = new SharedDataService();

module.exports = sharedDataService;