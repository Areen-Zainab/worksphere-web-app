package com.example.worksphere.dto;
import com.example.worksphere.entity.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest {
    private Long inviterId;
    private Long userId;
    private ProjectMember.Role role;
}

