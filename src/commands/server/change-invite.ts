import {
  Command,
  CommandContext,
  createStringOption,
  Declare,
  OKFunction,
  Options,
} from "seyfert";
import { InviteType } from "seyfert/lib/types";
import config from "../../config";
import guildModel from "../../database/models/guild.model";
import serverAutocomplete from "../../shared/autocompletes/server";
import CommandRuntimeError from "../../shared/errors/CommandRuntimeError";
import parseInviteCode from "../../shared/utils/parseInviteCode";

const options = {
  invite: createStringOption({
    description: "The invite to change the server's invite to",
    required: true,
    value(data, ok: OKFunction<string>) {
      return ok(parseInviteCode(data.value));
    },
  }),
  server: createStringOption({
    description: "The server to change the invite of",
    required: true,
    autocomplete: serverAutocomplete,
  }),
};

@Declare({
  name: "changeinvite",
  description: "Change the server's invite",
  contexts: ["Guild"],
})
@Options(options)
export default class ChangeInviteCommand extends Command {
  async run(context: CommandContext<typeof options>) {
    const guildId = context.options.server;
    const guildDoc = await guildModel.findById(guildId);

    if (!guildDoc) {
      throw new CommandRuntimeError("Servidor não encontrado no sistema");
    }

    if (guildDoc.pending) {
      throw new CommandRuntimeError("O servidor ainda não foi aprovado na EPF");
    }

    if (
      guildDoc.representative !== context.author.id &&
      !context.member?.roles.keys.some((id) => id === config.ids.roles.guard)
    ) {
      throw new CommandRuntimeError(
        "Você não é o representante desse servidor",
      );
    }

    const invite = await context.client.proxy
      .invites(context.options.invite)
      .get({ query: { with_expiration: true } })
      .catch(() => null);

    if (!invite?.guild || invite.type !== InviteType.Guild) {
      throw new CommandRuntimeError("Link de convite inválido");
    }

    if (invite.guild.id !== guildDoc._id) {
      throw new CommandRuntimeError(
        "O convite não pertence ao servidor selecionado",
      );
    }

    if (typeof invite.expires_at === "string") {
      throw new CommandRuntimeError(
        "O convite tem um tempo de expiração, crie um novo convite sem tempo de expiração",
      );
    }

    guildDoc.invite = invite.code;
    guildDoc.name = invite.guild.name;
    await guildDoc.save();

    if (guildDoc.role) {
      await context.guild()?.roles.edit(guildDoc.role, {
        name: invite.guild.name,
      });
    }

    // interaction.client.updateServersData([
    //   `<:icon_guild:1037801942149242926> **|** Novo convite para o servidor **${guildDoc.name}** foi gerado`,
    // ]);

    return context.write({
      content:
        `Convite do servidor \`${guildDoc.name}\` alterado com sucesso!\n` +
        `Novo convite: https://discord.gg/${invite.code}`,
    });
  }
}
