const Extension = require("./Extension")
const { PREFIX } = require("../config.js");

const Locale = new(require("../Classes/Locale/index.js"));

class Message extends Extension {

    async SetupExtension() {
        this.content = this.cleanInput(this.content);
        this.prefix = this.guild ? await this.guild.prefix() : PREFIX;
        let mentionRegex = new RegExp(`<@!?${this.client.user.id}>`);
        this._cutPrefix = this._mention(this.content) ? this.content.replace(mentionRegex, "").trim() : this.content.slice(this.prefix.length);
        this._contentSplit = this._cutPrefix.split(" ");
        this._suffixSplit = this._contentSplit.slice(1);
        this.command = this._contentSplit[0];
        this.args = this._suffixSplit.filter(t => t != "");
        this.suffix = this._suffixSplit.join(" ");

        this.t = await Locale.setLang(this);
    }

    cleanInput(txt) {
        const inplc = {
            "”": '"',
            "“": '"',
            "’": '"',
            "‘": '"'
        }
        txt = txt.replace(/[”“’‘]/g, c => inplc[c]);
        return txt;
    }

    get checkSuffix() {
        return this.suffix.replace(/\s/g, "").length > 0
    }

    suffixOf(index) {
        return this._suffixSplit.slice(index).join(" ").trim()
    }

    send(...args) {
        return this.channel.send(...args);
    }
    succ(...args) {
        return this.send(`✅ | **${args.shift()}** ${args.join(" ")}`);
    }
    fail(...args) {
        return this.send(`⛔ | **${args.shift()}** ${args.join(" ")}`);
    }
    warn(...args) {
        return this.send(`⚠ | **${args.shift()}** ${args.join(" ")}`);
    }
    succReact() {
        return this.react('341741537425621002');
    }
    failReact() {
        return this.react('341741537258110978');
    }

    authorPerm(...perms) {
        return this.author.checkPermission(this.channel, ...perms);
    }

    async fetchImage(returnAvatarOnFail) {
        try {
            var messages = await this.channel.messages.fetch({ limit: 3 })
        } catch (e) {
            return logger.warn(e);
        }
        for (let m of messages.values()) {
            if (m.attachments.size) {
                let url = m.attachments.first().url;
                if (this._imageUrl(url)) return url;
            }
            if (m.embeds.length) {
                if (m.embeds[0].thumbnail) {
                    let url = m.embeds[0].thumbnail.url;
                    if (this._imageUrl(url)) return url;
                }
            }
        }
        return returnAvatarOnFail ? this.author.displayAvatarURL() : null;
    }

    _imageUrl(url) {
        url = url.trim();
        if (/^<.+>$/.test(url)) url = url.substring(1, -1);
        let ends = /^.+\.(jpg|png|gif|webp)$/.test(url);
        return ends ? url : false;
    }

    _mention(text) {
        return text.startsWith(`<@${this.client.user.id}>`) || text.startsWith(`<@!${this.client.user.id}>`);
    }

    async parseUser(u) {

    }

    async parseMember(u) {
        if (/<@\d{17,19}>/.test(u) || /<@!\d{18,21}>/.test(u)) {
            let id = u.replace(/[^1234567890]/g, "")
            try {
                let member = await this.guild.members.fetch(id)
                return member
            } catch (err) {
                return null
            }
        }
        if (/\d{17,19}/.test(u)) {
            let id = u.replace(/[^1234567890]/g, "")
            try {
                let member = await this.guild.members.fetch(id)
                return member
            } catch (err) {
                return null
            }
        }
        if (/^.{2,32}#\d{4}$/.test(u)) {
            let [name, disc] = u.split("#")
            try {
                await this.guild.members.fetch()
                return this.guild.members.find(m => m.user.username.toLowerCase() === name.toLowerCase() && m.user.discriminator === disc)
            } catch (err) {
                return null
            }
        }
        if (/^.{2,32}$/.test(u)) {
            if (u.length < 2) return null
            try {
                await this.guild.members.fetch()
                return this.guild.members.find(m => m.user.username.toLowerCase().includes(u.toLowerCase()) || (m.nickname && m.nickname.toLowerCase().includes(u.toLowerCase())))
            } catch (err) {
                return null
            }
        }
        return null
    }

    async parseRole(u) {
        return null
    }

    async parseChannel(u) {
        if (/<#\d{17,19}>/.test(u)) {
            let id = u.replace(/[^1234567890]/g, "")
            return this.guild.channels.get(id) || false
        }
        if (/\d{17,19}/.test(u)) {
            let id = u.replace(/[^1234567890]/g, "")
            return this.guild.channels.get(id) || false
        }
        if (/^[a-z\-_]{2,100}$/.test(u)) {
            return this.guild.channels.find(c => c.name.toLowerCase().includes(u.toLowerCase()))
        }
        return null
    }

}

module.exports = Message;