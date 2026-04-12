package com.natagestao.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "projetos")
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(nullable = false)
    private String status = "Ativo"; // Ativo | Encerrado | Suspenso

    @Column(nullable = false)
    private String tipo; // Social | Educacional | Esportivo | Saúde

    @Column(name = "publico_alvo", nullable = false)
    private String publicoAlvo; // Comunidade | Residente | Ambos

    public Projeto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getPublicoAlvo() { return publicoAlvo; }
    public void setPublicoAlvo(String publicoAlvo) { this.publicoAlvo = publicoAlvo; }

    @Column(name = "imagem_url")
    private String imagemUrl;

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_funcionario_responsavel")
    @JsonIgnoreProperties({"senha", "hibernateLazyInitializer", "handler"})
    private Funcionario funcionarioResponsavel;

    public Funcionario getFuncionarioResponsavel() { return funcionarioResponsavel; }
    public void setFuncionarioResponsavel(Funcionario funcionarioResponsavel) { this.funcionarioResponsavel = funcionarioResponsavel; }
}
