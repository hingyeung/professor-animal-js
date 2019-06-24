class SharedDataService {
    constructor() {
        this.repo = {
            currentSessionId: undefined
        };
    }

    get currentSessionId() {
        return this.repo.currentSessionId;
    }
    
    set currentSessionId(sessionId) {
        this.repo.currentSessionId = sessionId;
    }
}

const sharedDataService = new SharedDataService();

module.exports = sharedDataService;