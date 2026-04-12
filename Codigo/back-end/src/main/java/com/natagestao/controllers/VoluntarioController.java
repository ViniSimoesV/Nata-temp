package com.natagestao.controllers;

import com.natagestao.models.Voluntario;
import com.natagestao.repositories.VoluntarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.natagestao.models.Projeto;
import com.natagestao.repositories.ProjetoRepository;
import java.util.HashSet;

import java.util.List;

@RestController
@RequestMapping("/api/voluntarios")
@CrossOrigin(origins = "*") // Permite que o seu HTML conecte aqui sem dar erro de CORS
public class VoluntarioController {

    @Autowired
    private VoluntarioRepository repository;
    @Autowired
    private ProjetoRepository projetoRepository;
    @Autowired
    private VoluntarioRepository voluntarioRepository;

    // 1. ROTA PARA LISTAR TODOS (Vai preencher a sua tabela no front)
    @GetMapping
    public List<Voluntario> listarTodos() {
        return repository.findAll();
    }

    // 2. ROTA PARA CADASTRAR NOVO VOLUNTÁRIO
    @PostMapping
    public ResponseEntity<Voluntario> criar(@RequestBody Voluntario voluntario) {
        // Se vier sem status, salva como Pendente
        if (voluntario.getStatus() == null || voluntario.getStatus().isEmpty()) {
            voluntario.setStatus("Pendente");
        }
        
        Voluntario novoVoluntario = repository.save(voluntario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoVoluntario);
    }

    // 3. ROTA PARA ATUALIZAR UM VOLUNTÁRIO (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Voluntario> atualizar(@PathVariable Long id, @RequestBody Voluntario dadosAtualizados) {
        return repository.findById(id)
                .map(voluntarioExistente -> {
                    // Atualiza os dados velhos com os dados novos
                    voluntarioExistente.setNome(dadosAtualizados.getNome());
                    voluntarioExistente.setEmail(dadosAtualizados.getEmail());
                    voluntarioExistente.setTelefone(dadosAtualizados.getTelefone());
                    voluntarioExistente.setDataNascimento(dadosAtualizados.getDataNascimento());
                    voluntarioExistente.setHabilidades(dadosAtualizados.getHabilidades());
                    voluntarioExistente.setOutrasHabilidades(dadosAtualizados.getOutrasHabilidades());
                    voluntarioExistente.setDiasDisponiveis(dadosAtualizados.getDiasDisponiveis());
                    voluntarioExistente.setTurnosDisponiveis(dadosAtualizados.getTurnosDisponiveis());
                    voluntarioExistente.setObservacoesDisponibilidade(dadosAtualizados.getObservacoesDisponibilidade());
                    
                    Voluntario salvo = repository.save(voluntarioExistente);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    // ==========================================
    // VINCULAR PROJETOS AO VOLUNTÁRIO
    // ==========================================
    @PostMapping("/{id}/projetos")
    public ResponseEntity<Voluntario> vincularProjetos(@PathVariable Long id, @RequestBody List<Long> projetoIds) {
        return repository.findById(id).map(voluntario -> {
            // Busca todos os projetos no banco que tenham os IDs que o JS enviou
            List<Projeto> projetosEncontrados = projetoRepository.findAllById(projetoIds);
            
            // Salva a lista de projetos dentro do voluntário
            voluntario.setProjetos(new HashSet<>(projetosEncontrados));
            
            // Salva no banco de dados
            Voluntario salvo = repository.save(voluntario);
            return ResponseEntity.ok(salvo);
        }).orElse(ResponseEntity.notFound().build());
    }
    // ==========================================
    // DELETAR VOLUNTÁRIO (DELETE)
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVoluntario(@PathVariable Long id) {
        // Mudamos de voluntarioRepository para repository
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build(); // Retorna código 204 (Sucesso, mas sem conteúdo)
        }
        return ResponseEntity.notFound().build(); // Retorna 404 se o ID não existir
    }
}