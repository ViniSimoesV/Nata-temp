package com.natagestao.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "voluntarios")
public class Voluntario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true)
    private String email;

    private String telefone;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(columnDefinition = "TEXT")
    private String habilidades;

    @Column(columnDefinition = "TEXT")
    private String outrasHabilidades;

    @Column(columnDefinition = "TEXT")
    private String diasDisponiveis;

    @Column(columnDefinition = "TEXT")
    private String turnosDisponiveis;

    @Column(columnDefinition = "TEXT")
    private String observacoesDisponibilidade;

    private String status; // Ex: Ativo, Pendente, Inativo

    // ==========================================
    // 👇 A NOVIDADE ENTRA AQUI! (Associação com Projetos)
    // ==========================================
    @ManyToMany
    @JoinTable(
        name = "voluntario_projeto", // Cria uma tabela invisível no banco para ligar os dois
        joinColumns = @JoinColumn(name = "voluntario_id"),
        inverseJoinColumns = @JoinColumn(name = "projeto_id")
    )
    private Set<Projeto> projetos = new HashSet<>();

    // Construtor vazio (O Spring Boot exige isso)
    public Voluntario() {}

    // ==========================================
    // GETTERS E SETTERS (Para o Java acessar os dados)
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHabilidades() { return habilidades; }
    public void setHabilidades(String habilidades) { this.habilidades = habilidades; }

    public String getOutrasHabilidades() { return outrasHabilidades; }
    public void setOutrasHabilidades(String outrasHabilidades) { this.outrasHabilidades = outrasHabilidades; }

    public String getDiasDisponiveis() { return diasDisponiveis; }
    public void setDiasDisponiveis(String diasDisponiveis) { this.diasDisponiveis = diasDisponiveis; }

    public String getTurnosDisponiveis() { return turnosDisponiveis; }
    public void setTurnosDisponiveis(String turnosDisponiveis) { this.turnosDisponiveis = turnosDisponiveis; }

    public String getObservacoesDisponibilidade() { return observacoesDisponibilidade; }
    public void setObservacoesDisponibilidade(String observacoesDisponibilidade) { this.observacoesDisponibilidade = observacoesDisponibilidade; }

    // 👇 E OS GETTERS/SETTERS DOS PROJETOS ENTRAM AQUI NO FINAL
    public Set<Projeto> getProjetos() { return projetos; }
    public void setProjetos(Set<Projeto> projetos) { this.projetos = projetos; }
}