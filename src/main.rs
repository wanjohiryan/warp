#![windows_subsystem = "windows"]
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use std::{env, io};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
    task,
};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::protocol::Message;
use vigem_client::XNotification;
#[derive(Debug, Deserialize, Serialize)]
struct XGamepadJson {
    buttons: Vec<String>,
    left_trigger: u8,
    right_trigger: u8,
    thumb_lx: i16,
    thumb_ly: i16,
    thumb_rx: i16,
    thumb_ry: i16,
}

#[tokio::main]
async fn main() -> Result<(), io::Error> {
    // Create a TcpListener and bind it to an address
    let addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:9002".to_string());
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    println!("Listening on: {}", addr);

    // Connect to the ViGEmBus driver
    let client = Arc::new(vigem_client::Client::connect().unwrap());

    // Create a semaphore with 4 permits
    // only 4 gamepads can be created at a time
    let semaphore = Arc::new(tokio::sync::Semaphore::new(4));

    // Loop over incoming connections
    while let Ok((stream, _)) = listener.accept().await {
        // Acquire a permit from the semaphore
        let _permit = semaphore.clone().acquire_owned().await.unwrap();

        //TODO: send an error to client

        let vigem = Arc::clone(&client);

        let semaphore_clone = semaphore.clone();
        task::spawn(async move {
            handle_connection(stream, vigem).await;

            semaphore_clone.add_permits(1);
        });
    }

    Ok(())
}

// Handle each connection in a separate task
async fn handle_connection(stream: TcpStream, client: Arc<vigem_client::Client>) {
    // Upgrade the TCP stream to a WebSocket stream
    let ws_stream = accept_async(stream).await.expect("Failed to accept");

    // Split the stream into sink and stream parts
    let (ws_sink, mut ws_stream) = ws_stream.split();

    // Create the virtual controller target
    let id = vigem_client::TargetId::XBOX360_WIRED;
    let mut target = vigem_client::Xbox360Wired::new(client, id);

    // Plugin the virtual controller
    target.plugin().unwrap();

    // Wait for the virtual controller to be ready to accept updates
    target.wait_ready().unwrap();

    // Create a channel for broadcasting notifications to the WebSocket client
    let (notification_tx, mut notification_rx) = tokio::sync::broadcast::channel(16);

    let ws_sender = Arc::new(Mutex::new(ws_sink));

    // Spawn a task to handle sending notifications to the WebSocket client
    let ws_sink_clone = ws_sender.clone();

    // Create a thread to handle notifications
    let thread = target
        .request_notification()
        .unwrap()
        .spawn_thread(move |_, data| {
            let _ = notification_tx.send(XNotification {
                large_motor: data.large_motor,
                small_motor: data.small_motor,
                led_number: data.led_number,
            });
        });

    let _notification_task = tokio::task::spawn(async move {
        while let Ok(notification) = notification_rx.recv().await {
            // let notification:XNotification = notification_rx.try_recv().unwrap();

            let msg = json!({
                "large_motor": notification.large_motor.to_string(),
                "small_motor": notification.small_motor.to_string(),
            });

            let mut ws_sink = ws_sink_clone.lock().await;
            ws_sink.send(Message::Text(msg.to_string())).await.unwrap();
        }
    });

    // Respond with "OK" to show server is running
    ws_sender
        .lock()
        .await
        .send(Message::Text("OK".to_string()))
        .await
        .unwrap();

    // Iterate over incoming messages
    while let Some(msg) = ws_stream.next().await {
        match msg {
            // If it is an empty message [Health check]
            Ok(Message::Text(data)) if data.is_empty() => {
                // Return "OK"
                ws_sender
                    .lock()
                    .await
                    .send(Message::Text("OK".to_string()))
                    .await
                    .unwrap();
            }
            // If it is a non-empty text message
            Ok(Message::Text(data)) => {
                // Try to parse it as json
                if let Ok(gpad_input) = serde_json::from_slice::<XGamepadJson>(&data.as_bytes()) {
                    // Use the extracted fields to construct a new vigem_client::XGamepad instance
                    // let gamepad = handle_input(gpad_input)?;
                    // let _ = target.update(&gamepad);
                    match handle_input(gpad_input) {
                        Ok(gamepad) => {
                            let _ = target.update(&gamepad);
                        }
                        Err(_) => {
                            // handle the error case here
                        }
                    }
                } else {
                    // Invalid json format
                    eprintln!("Invalid json: {}", data);
                }
            }
            // If it is a ping message
            Ok(Message::Ping(data)) => {
                // Reply with a pong message with same data
                ws_sender
                    .lock()
                    .await
                    .send(Message::Pong(data))
                    .await
                    .unwrap();
            }
            // If it is a close message
            Ok(Message::Close(reason)) => {
                // Respond with a close message with same reason if any
                ws_sender
                    .lock()
                    .await
                    .send(Message::Close(reason))
                    .await
                    .unwrap();
                break;
            }
            _ => {}
        }
    }

    // Dropping the target causes the notification request to abort and the thread to return
    drop(target);
    thread.join().unwrap();
}

//handle input and map into necessary values
fn handle_input(gpad_input: XGamepadJson) -> Result<vigem_client::XGamepad, ()> {
    let button_states = gpad_input.buttons.iter().fold(0u16, |acc, b| {
        let button_state = match b.to_string().as_str() {
            "A" => vigem_client::XButtons::A,
            "B" => vigem_client::XButtons::B,
            "X" => vigem_client::XButtons::X,
            "Y" => vigem_client::XButtons::Y,
            "UP" => vigem_client::XButtons::UP,       //DPAD_UP
            "DOWN" => vigem_client::XButtons::DOWN,   //DPAD_DOWN
            "LEFT" => vigem_client::XButtons::LEFT,   //DPAD_LEFT
            "RIGHT" => vigem_client::XButtons::RIGHT, //DPAD_RIGHT
            "LB" => vigem_client::XButtons::LB,       //left shoulder
            "RB" => vigem_client::XButtons::RB,       //right shoulder
            "BACK" => vigem_client::XButtons::BACK,
            "START" => vigem_client::XButtons::START,
            "LS" => vigem_client::XButtons::LTHUMB, //LEFT_THUMB,
            "RS" => vigem_client::XButtons::RTHUMB, //RIGHT_THUMB,
            _ => 0,
        };
        acc | button_state as u16
    });

    let gamepad = vigem_client::XGamepad {
        buttons: vigem_client::XButtons { raw: button_states },
        left_trigger: gpad_input.left_trigger,
        right_trigger: gpad_input.right_trigger,
        thumb_lx: gpad_input.thumb_lx,
        thumb_ly: gpad_input.thumb_ly,
        thumb_rx: gpad_input.thumb_rx,
        thumb_ry: gpad_input.thumb_ry,
        ..Default::default()
    };

    Ok(gamepad)
}
