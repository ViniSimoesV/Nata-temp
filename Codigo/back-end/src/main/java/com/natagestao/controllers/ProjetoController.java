package com.natagestao.controllers;

import com.natagestao.models.Projeto;
import com.natagestao.repositories.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class ProjetoController {

    @Autowired
    private ProjetoRepository repository;

    @GetMapping
    public List<Projeto> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projeto> buscarPorId(@PathVariable Long id) {
        Optional<Projeto> projeto = repository.findById(id);
        return projeto.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Projeto criar(@RequestBody Projeto projeto) {
        if (projeto.getStatus() == null || projeto.getStatus().isEmpty()) {
            projeto.setStatus("Ativo");
        }
        // funcionarioResponsavel comes from JSON body (can be null)
        return repository.save(projeto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Projeto> atualizar(@PathVariable Long id, @RequestBody Projeto dados) {
        return repository.findById(id).map(projeto -> {
            projeto.setNome(dados.getNome());
            projeto.setDescricao(dados.getDescricao());
            projeto.setDataInicio(dados.getDataInicio());
            projeto.setDataFim(dados.getDataFim());
            projeto.setStatus(dados.getStatus());
            projeto.setTipo(dados.getTipo());
            projeto.setPublicoAlvo(dados.getPublicoAlvo());
            projeto.setImagemUrl(dados.getImagemUrl());
            projeto.setFuncionarioResponsavel(dados.getFuncionarioResponsavel());
            return ResponseEntity.ok(repository.save(projeto));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
