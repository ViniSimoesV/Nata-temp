package com.natagestao.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarEmailSenha(String para, String nome, String senhaGerada) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("natasistema120@gmail.com");
        message.setTo(para);
        message.setSubject("Bem-vindo! Suas credenciais de acesso");
        message.setText("Olá " + nome + ",\n\n" +
                        "Seu cadastro foi realizado com sucesso.\n" +
                        "Sua senha temporária é: " + senhaGerada + "\n\n" +
                        "Recomendamos alterá-la no primeiro acesso.");

        mailSender.send(message);
    }

    public void enviarEmailRedefinirSenha (String para, String nome, String codigo){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("natasistema120@gmail.com");
        message.setTo(para);
        message.setSubject("Código redefinição de senha");
        message.setText("Olá " + nome + ",\n\n" +
                        "Seu código de redefinição de senha é: " + codigo +  ". Esse código sera válido para os próximos 15 minutos\n" +
                        "Se não foi você quem solicitou este código favor desconsiderar, não envie esse código para ninguém.");

        mailSender.send(message);
    }
}
