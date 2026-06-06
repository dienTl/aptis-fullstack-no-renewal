package com.aptisfullstack.controller;

import com.aptisfullstack.dto.Dto.MessageRequest;
import com.aptisfullstack.service.*;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;

@Controller @RequiredArgsConstructor
public class WebSocketController {
  private final ContentService content;
  private final UserService users;
  @MessageMapping("/chat") public void chat(MessageRequest r, Principal principal) { content.send(users.byEmail(principal.getName()), r); }
  @MessageMapping("/presence") @SendTo("/topic/presence") public String presence(String status) { return status; }
}
