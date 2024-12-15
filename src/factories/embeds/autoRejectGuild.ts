import { EmbedBuilder } from "discord.js";
import config from "../../config.js";

type Props = {
  sender: {
    id: string;
    username: string;
  };
  epfAbout: string;
  serverAbout: string;
  role: string | null;
  errors: string[];
  inviteUrl?: string;
};

export function autoRejectEmbed({
  errors,
  sender,
  epfAbout,
  serverAbout,
  role,
  inviteUrl,
}: Props): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Formulário Recusado")
    .setColor("#d12c2c")
    .setFields([
      {
        name: "Enviado por",
        value: `${sender.username} (${sender.id})`,
        inline: true,
      },
      {
        name: "Link permanente do servidor",
        value: `${inviteUrl || "Inválido"}`,
        inline: true,
      },
      {
        name: "Cargo Principal no Servidor",
        value: `${role || "Inválido"}`,
        inline: true,
      },
      { name: "Sobre o servidor", value: `${serverAbout}`, inline: false },
      {
        name: "Por onde conheceu a EPF",
        value: `${epfAbout}`,
        inline: false,
      },
      {
        name: "Recusado pelo Motivo",
        value: `${errors.join("\n")}`,
        inline: true,
      },
      {
        name: "Recusado por",
        value: `<@${config.ids.agent}> (${config.ids.agent})`,
        inline: true,
      },
    ]);
}
