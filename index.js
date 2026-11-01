const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.User, Partials.GuildMember, Partials.Message]
});

// AYARLAR
const TOKEN = process.env.TOKEN;
const GMR_KANAL_ID = '1566180919155499110';
const ROL_SECIM_KANAL_ID = '1566184536147239015';
const BARBIES_ROL_ID = '1566184130067038388';
const GARIBAN_ROL_ID = '1566184159708319804';
const OWO_KANAL_ID = '1566189354442031154';
const SES_KANAL_ID = '1566181709202853978';

// Ses Kanalına Bağlanma Kısmı
    try {
        const guild = client.guilds.cache.first(); // Veya belirli bir sunucu ID'si
        if (guild) {
            joinVoiceChannel({
                channelId: SES_KANAL_ID,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true, // Kulaklığı sağırlaştırılmış şekilde girer
                selfMute: true  // Susturulmuş şekilde girer
            });
            console.log('Bot başarıyla ses kanalına giriş yaptı ve uykusuz mod açıldı!');
        }
    } catch (error) {
        console.error('Ses kanalına girerken hata oluştu:', error);
    }

client.once('clientReady', async () => {
    console.log(`Bot aktif: ${client.user.tag}`);

    try {
        const kanal = await client.channels.fetch(ROL_SECIM_KANAL_ID);
        if (kanal) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('barbies_sec')
                        .setLabel('Barbies (Kadın)')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('💅'),
                    new ButtonBuilder()
                        .setCustomId('gariban_sec')
                        .setLabel('Gariban (Erkek)')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🧢')
                );

            await kanal.send({
                content: '\nCinsiyetini sec.',
                components: [row]
            });
        }
    } catch (err) {
        console.error('Buton mesajı gönderilemedi:', err);
    }
});

// Giriş Mesajı
client.on('guildMemberAdd', async (member) => {
    const kanal = member.guild.channels.cache.get(GMR_KANAL_ID);
    if (!kanal) return;

    kanal.send(`${member} sunucuya katildi.`);
});

// Çıkış Mesajı (Burada eklendi!)
client.on('guildMemberRemove', async (member) => {
    const kanal = member.guild.channels.cache.get(GMR_KANAL_ID);
    if (!kanal) return;

    kanal.send(`${member.user.tag} sunucudan cıktı.`);
});

// Buton Etkileşimi (Rol Verme / Alma)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const member = interaction.member;

    try {
        if (interaction.customId === 'barbies_sec') {
            await member.roles.add(BARBIES_ROL_ID);
            await member.roles.remove(GARIBAN_ROL_ID).catch(() => {});
            await interaction.editReply({ content: 'Başarıyla **barbies** rolü verildi! 💅' });
        } 
        else if (interaction.customId === 'gariban_sec') {
            await member.roles.add(GARIBAN_ROL_ID);
            await member.roles.remove(BARBIES_ROL_ID).catch(() => {});
            await interaction.editReply({ content: 'Başarıyla **gariban** rolü verildi! 🧢' });
        }
    } catch (error) {
        console.error('Rol verme hatası:', error);
        await interaction.editReply({ content: 'Rol verilirken bir hata oluştu! Botun rolü, verilecek rollerden yukarıda mi kontrol et.' });
    }
});

// OwO Botu Engelleyici / Yönlendirici Filtre (Güncellendi)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const icerik = message.content.toLowerCase().trim();
    const owoKomutMu = icerik.startsWith('w ') || icerik === 'w' || icerik.startsWith('owo') || icerik.startsWith('uwu');

    if (owoKomutMu && message.channel.id !== OWO_KANAL_ID) {
        try {
            await message.delete();
            
            // Etiket atılmadan sadece düz metin uyarısı
            const sentMessage = await message.channel.send(`${message.author}, <#${OWO_KANAL_ID}> kanalında oyna owo'nu.`);
            
            setTimeout(() => {
                sentMessage.delete().catch(() => {});
            }, 5000);
            
        } catch (err) {
            console.error('OwO mesajı engellenirken hata oluştu:', err);
        }
    }
});

client.login(TOKEN);