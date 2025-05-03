package com.example.worksphere.dto;
import com.example.worksphere.entity.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest {
    private Long inviterId;
    private String userEmail; // Changed from userId to userEmail
    private ProjectMember.Role role;
    
    // Getters and setters
    public Long getInviterId() {
        return inviterId;
    }
    
    public void setInviterId(Long inviterId) {
        this.inviterId = inviterId;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

}