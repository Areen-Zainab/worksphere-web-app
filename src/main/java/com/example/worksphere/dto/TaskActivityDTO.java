
package com.example.worksphere.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskActivityDTO {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long userId;
    private String userName;
    private String action;
    private String changedData;
    private LocalDateTime createdAt;
    
    // Helper fields for frontend display
    private String actionIcon;
    private String actionColor;
    
    // Helper method to set icon and color based on action type
    public void setDisplayProperties() {
        switch(action) {
            case "CREATED":
                actionIcon = "add_circle";
                actionColor = "success";
                break;
            case "UPDATED":
                actionIcon = "edit";
                actionColor = "primary";
                break;
            case "DELETED":
                actionIcon = "delete";
                actionColor = "error";
                break;
            case "STATUS_CHANGED":
                actionIcon = "swap_horiz";
                actionColor = "info";
                break;
            case "ASSIGNED":
                actionIcon = "person_add";
                actionColor = "success";
                break;
            case "UNASSIGNED":
                actionIcon = "person_remove";
                actionColor = "warning";
                break;
            case "PRIORITY_CHANGED":
                actionIcon = "priority_high";
                actionColor = "warning";
                break;
            case "DEADLINE_CHANGED":
                actionIcon = "event";
                actionColor = "primary";
                break;
            case "COMMENTED":
                actionIcon = "comment";
                actionColor = "info";
                break;
            case "LABEL_ADDED":
                actionIcon = "label";
                actionColor = "success";
                break;
            case "LABEL_REMOVED":
                actionIcon = "label_off";
                actionColor = "warning";
                break;
            case "ATTACHMENT_ADDED":
                actionIcon = "attach_file";
                actionColor = "success";
                break;
            case "ATTACHMENT_REMOVED":
                actionIcon = "attachment_off";
                actionColor = "warning";
                break;
            default:
                actionIcon = "info";
                actionColor = "default";
        }
    }
}