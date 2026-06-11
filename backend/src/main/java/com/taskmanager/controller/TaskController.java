package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // GET /api/tasks - View all tasks belonging to the logged-in user
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks(Principal principal) {
        List<TaskDto> tasks = taskService.getAllTasks(principal.getName());
        return ResponseEntity.ok(tasks);
    }

    // GET /api/tasks/{id} - View details of a specific task
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id, Principal principal) {
        TaskDto taskDto = taskService.getTaskById(id, principal.getName());
        return ResponseEntity.ok(taskDto);
    }

    // POST /api/tasks - Create a new task
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, Principal principal) {
        TaskDto createdTask = taskService.createTask(taskDto, principal.getName());
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    // PUT /api/tasks/{id} - Update task information
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto, Principal principal) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto, principal.getName());
        return ResponseEntity.ok(updatedTask);
    }

    // DELETE /api/tasks/{id} - Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id, Principal principal) {
        taskService.deleteTask(id, principal.getName());
        return ResponseEntity.ok("Task deleted successfully");
    }
}
