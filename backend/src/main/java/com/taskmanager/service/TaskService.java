package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import java.util.List;

public interface TaskService {
    TaskDto createTask(TaskDto taskDto, String userEmail);
    List<TaskDto> getAllTasks(String userEmail);
    TaskDto getTaskById(Long id, String userEmail);
    TaskDto updateTask(Long id, TaskDto taskDto, String userEmail);
    void deleteTask(Long id, String userEmail);
}
