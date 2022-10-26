module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log (`Logado em ${client.user.tag} (${client.user.id})`);
    }
}